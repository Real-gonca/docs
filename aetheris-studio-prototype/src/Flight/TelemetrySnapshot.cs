using Aetheris.Core;

namespace Aetheris.Flight;

public sealed class TelemetrySnapshot
{
    public double SimTimeS { get; set; }
    public Vector3d PositionEci { get; set; }
    public Vector3d VelocityEci { get; set; }
    public double AltitudeM { get; set; }
    public double SpeedMS { get; set; }
    public double MassKg { get; set; }
    public double DeltaVRemainingMS { get; set; }
    public double ThrustFraction { get; set; }
    public double ElevationDeg { get; set; }
    public double AzimuthDeg { get; set; }
    public double RangeKm { get; set; }
    public bool HasAccess { get; set; }
    public double GsLatDeg { get; set; }
    public double GsLonDeg { get; set; }
}
