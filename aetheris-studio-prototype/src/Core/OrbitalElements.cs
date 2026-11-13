namespace Aetheris.Core;

public sealed class OrbitalElements
{
    public double SemiMajorAxis { get; set; }      // a, m
    public double Eccentricity { get; set; }       // e
    public double Inclination { get; set; }        // rad
    public double RightAscension { get; set; }     // rad (RAAN)
    public double ArgumentOfPeriapsis { get; set; } // rad
    public double TrueAnomaly { get; set; }        // rad
    public double Epoch { get; set; }              // s
    public double MeanMotion { get; set; }         // rad/s
    public double Period => 2 * Math.PI / MeanMotion;
}
