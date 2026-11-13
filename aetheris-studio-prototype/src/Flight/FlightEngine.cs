using System;
using Aetheris.Core;

namespace Aetheris.Flight;

public sealed class FlightEngine
{
    public Spacecraft Craft { get; }
    public GroundStation? Station { get; set; }
    public double Dt { get; set; } = 1.0;
    public double SimTimeS { get; private set; }
    public double ThrustFraction { get; set; }
    public Vector3d PositionEci { get; private set; }
    public Vector3d VelocityEci { get; private set; }
    public bool IsFlying { get; private set; } = true;

    public FlightEngine(Spacecraft craft, GroundStation station, Vector3d r0, Vector3d v0)
    {
        Craft = craft; Station = station; PositionEci = r0; VelocityEci = v0;
    }

    public void Step()
    {
        if (!IsFlying) return;
        double rMag = PositionEci.Magnitude;
        Vector3d gravity = -Constants.EarthMu * PositionEci / (rMag * rMag * rMag)
                         + OrbitalMath.J2Acceleration(PositionEci);

        // Empuxo sempre pró-grada (direção de controle do usuário no protótipo).
        var dir = VelocityEci.Magnitude > 0 ? VelocityEci.Normalized : Vector3d.UnitZ;
        Craft.ThrustDirection = dir;
        bool hasProp = Craft.PropellantRemainingKg > 1e-6
                    || Craft.ActiveStageIndex + 1 < Craft.Stages.Count;
        Vector3d thrustAcc = hasProp ? Craft.ThrustAcceleration(ThrustFraction) : Vector3d.Zero;

        VelocityEci += (gravity + thrustAcc) * Dt;
        PositionEci += VelocityEci * Dt;
        Craft.ConsumePropellant(ThrustFraction, Dt);
        SimTimeS += Dt;

        if (PositionEci.Magnitude < Constants.EarthRadius) IsFlying = false; // impacto / reentrada
    }

    public TelemetrySnapshot Snapshot(double gstRad)
    {
        var access = Station != null ? Station.Topocentric(ToEcef(gstRad), gstRad)
                                     : new AccessResult { HasAccess = false };
        double rMag = PositionEci.Magnitude;
        double lon = Math.Atan2(PositionEci.Y, PositionEci.X) - gstRad;
        double lat = Math.Atan2(PositionEci.Z, Math.Sqrt(PositionEci.X * PositionEci.X + PositionEci.Y * PositionEci.Y));

        return new TelemetrySnapshot
        {
            SimTimeS = SimTimeS,
            PositionEci = PositionEci,
            VelocityEci = VelocityEci,
            AltitudeM = rMag - Constants.EarthRadius,
            SpeedMS = VelocityEci.Magnitude,
            MassKg = Craft.TotalMassKg,
            DeltaVRemainingMS = Craft.DeltaVRemainingMS,
            ThrustFraction = ThrustFraction,
            ElevationDeg = access.ElevationDeg,
            AzimuthDeg = access.AzimuthDeg,
            RangeKm = access.RangeKm,
            HasAccess = access.HasAccess,
            GsLatDeg = lat * 180 / Math.PI,
            GsLonDeg = lon * 180 / Math.PI
        };
    }

    Vector3d ToEcef(double gst)
    {
        double c = Math.Cos(gst), s = Math.Sin(gst);
        return new Vector3d(c * PositionEci.X - s * PositionEci.Y,
                            s * PositionEci.X + c * PositionEci.Y,
                            PositionEci.Z);
    }
}
