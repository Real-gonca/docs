using System;
using Aetheris.Core;

namespace Aetheris.Link;

public sealed class AccessResult
{
    public double ElevationDeg { get; set; }
    public double AzimuthDeg { get; set; }
    public double RangeKm { get; set; }
    public bool HasAccess { get; set; }
}

public sealed class LinkBudgetResult
{
    public double FsplDb { get; set; }
    public double ReceivedPowerDbw { get; set; }
    public double SnrDb { get; set; }
    public double EstimatedDataRateBps { get; set; }
}

public sealed class GroundStation
{
    public string Name { get; set; } = "Estação";
    public double LatitudeDeg { get; set; }
    public double LongitudeDeg { get; set; }
    public double AltitudeM { get; set; }
    public double MinElevationDeg { get; set; } = 5.0;
    public double FrequencyHz { get; set; } = 2.2e9;
    public double TransmitPowerW { get; set; } = 10.0;
    public double TxGainDbi { get; set; } = 3.0;
    public double RxGainDbi { get; set; } = 3.0;
    public double SystemLossDb { get; set; } = 3.0;
    public double BandwidthHz { get; set; } = 1e6;

    public Vector3d Ecef(double gstRad)
    {
        double lat = LatitudeDeg * Math.PI / 180;
        double lonGst = LongitudeDeg * Math.PI / 180 + gstRad;
        double sl = Math.Sin(lat);
        double n = Constants.EarthRadius / Math.Sqrt(1 - Constants.EarthEccentricitySquared * sl * sl);
        double cl = Math.Cos(lat);
        return new Vector3d(
            (n + AltitudeM) * cl * Math.Cos(lonGst),
            (n + AltitudeM) * cl * Math.Sin(lonGst),
            (n * (1 - Constants.EarthEccentricitySquared) + AltitudeM) * sl);
    }

    // Converte posição do satélite (ECEF) em coordenadas topocêntricas da estação (E/N/U).
    public AccessResult Topocentric(Vector3d satEcef, double gstRad)
    {
        var station = Ecef(gstRad);
        var rel = satEcef - station;
        double lat = LatitudeDeg * Math.PI / 180;
        double lonGst = LongitudeDeg * Math.PI / 180 + gstRad;
        double sl = Math.Sin(lat), cl = Math.Cos(lat);
        double so = Math.Sin(lonGst), co = Math.Cos(lonGst);

        var east = new Vector3d(-so, co, 0);
        var north = new Vector3d(-sl * co, -sl * so, cl);
        var up = new Vector3d(cl * co, cl * so, sl);

        double eastK = Vector3d.Dot(rel, east);
        double northK = Vector3d.Dot(rel, north);
        double upK = Vector3d.Dot(rel, up);
        double range = rel.Magnitude;
        double elevation = range > 0 ? Math.Asin(upK / range) : -Math.PI / 2;
        double azimuth = Math.Atan2(eastK, northK); // 0 = norte
        if (azimuth < 0) azimuth += 2 * Math.PI;

        return new AccessResult
        {
            ElevationDeg = elevation * 180 / Math.PI,
            AzimuthDeg = azimuth * 180 / Math.PI,
            RangeKm = range / 1000,
            HasAccess = elevation >= MinElevationDeg * Math.PI / 180 && upK > 0
        };
    }

    // Orçamento de enlace simplificado (lei de Friis + potência térmica kTB + limite de Shannon).
    public LinkBudgetResult LinkBudget(double rangeKm)
    {
        double lambda = Constants.SpeedOfLight / FrequencyHz;
        double d = rangeKm * 1000;
        double fsplDb = 20 * Math.Log10(4 * Math.PI * d / lambda);
        double ptDbw = 10 * Math.Log10(TransmitPowerW);
        double prDbw = ptDbw + TxGainDbi + RxGainDbi - fsplDb - SystemLossDb;
        double noiseDbw = -203.97 + 10 * Math.Log10(BandwidthHz); // kTB, T = 290 K
        double snrDb = prDbw - noiseDbw;
        double snrLin = Math.Pow(10, snrDb / 10);
        double shannon = BandwidthHz * Math.Log2(1 + snrLin);
        return new LinkBudgetResult
        {
            FsplDb = fsplDb, ReceivedPowerDbw = prDbw,
            SnrDb = snrDb, EstimatedDataRateBps = snrDb > -10 ? shannon : 0
        };
    }
}
