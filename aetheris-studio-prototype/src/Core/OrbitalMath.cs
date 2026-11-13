using System;

namespace Aetheris.Core;

public static class OrbitalMath
{
    // Converte vetor de estado (r, v) em elementos keplerianos clássicos (dois corpos).
    public static OrbitalElements RvToElements(Vector3d r, Vector3d v, double mu, double epochSeconds)
    {
        double rm = r.Magnitude;
        double v2 = Vector3d.Dot(v, v);
        double rv = Vector3d.Dot(r, v);
        double energy = 0.5 * v2 - mu / rm;
        double a = -mu / (2.0 * energy);
        Vector3d h = Vector3d.Cross(r, v);
        double hm = h.Magnitude;
        double i = Math.Acos(Clamp(h.Z / hm, -1, 1));
        var k = new Vector3d(0, 0, 1);
        Vector3d node = Vector3d.Cross(k, h);
        double nm = node.Magnitude;
        double raan = nm > 1e-12 ? Math.Atan2(node.Y, node.X) : 0.0;
        if (raan < 0) raan += 2 * Math.PI;

        Vector3d evec = ((v2 - mu / rm) * r - rv * v) / mu;
        double e = evec.Magnitude;
        double argp = 0.0, nu = 0.0;
        if (e > 1e-12 && nm > 1e-12)
        {
            double cosArg = Clamp(Vector3d.Dot(node, evec) / (nm * e), -1, 1);
            double sinArg = Vector3d.Dot(Vector3d.Cross(node, evec), h) / (nm * e * hm);
            argp = Math.Atan2(sinArg, cosArg);
            if (argp < 0) argp += 2 * Math.PI;
        }
        if (e > 1e-12 && rm > 0)
        {
            double cosNu = Clamp(Vector3d.Dot(evec, r) / (e * rm), -1, 1);
            double sinNu = Vector3d.Dot(Vector3d.Cross(evec, r), h) / (e * rm * hm);
            nu = Math.Atan2(sinNu, cosNu);
            if (nu < 0) nu += 2 * Math.PI;
        }

        double n = Math.Sqrt(mu / Math.Abs(a * a * a));
        if (a < 0) n = -n; // guarda para órbitas hiperbólicas (o demo usa elípticas)
        return new OrbitalElements
        {
            SemiMajorAxis = a, Eccentricity = e, Inclination = i,
            RightAscension = raan, ArgumentOfPeriapsis = argp,
            TrueAnomaly = nu, Epoch = epochSeconds, MeanMotion = n
        };
    }

    // Converte elementos keplerianos de volta para vetor de estado (dois corpos).
    public static (Vector3d R, Vector3d V) ElementsToRv(OrbitalElements oe, double mu)
    {
        double a = oe.SemiMajorAxis, e = oe.Eccentricity, i = oe.Inclination;
        double raan = oe.RightAscension, argp = oe.ArgumentOfPeriapsis, nu = oe.TrueAnomaly;
        double p = a * (1 - e * e);
        double rMag = p / (1 + e * Math.Cos(nu));
        double h = Math.Sqrt(mu * p);

        double rxP = rMag * Math.Cos(nu);
        double ryP = rMag * Math.Sin(nu);
        double vxP = -mu / h * Math.Sin(nu);
        double vyP = mu / h * (e + Math.Cos(nu));

        double ca = Math.Cos(argp), sa = Math.Sin(argp);
        double ci = Math.Cos(i), si = Math.Sin(i);
        double co = Math.Cos(raan), so = Math.Sin(raan);

        double x = (co * ca - so * sa * ci) * rxP + (-co * sa - so * ca * ci) * ryP;
        double y = (so * ca + co * sa * ci) * rxP + (-so * sa + co * ca * ci) * ryP;
        double z = (sa * si) * rxP + (ca * si) * ryP;
        double vx = (co * ca - so * sa * ci) * vxP + (-co * sa - so * ca * ci) * vyP;
        double vy = (so * ca + co * sa * ci) * vxP + (-so * sa + co * ca * ci) * vyP;
        double vz = (sa * si) * vxP + (ca * si) * vyP;

        return (new Vector3d(x, y, z), new Vector3d(vx, vy, vz));
    }

    // Resolve a equação de Kepler M = E - e·sen(E) (Newton-Raphson).
    public static double SolveKepler(double M, double e)
    {
        M = WrapTwoPi(M);
        double E = M;
        for (int k = 0; k < 50; k++)
        {
            double f = E - e * Math.Sin(E) - M;
            double fp = 1.0 - e * Math.Cos(E);
            double d = f / fp;
            E -= d;
            if (Math.Abs(d) < 1e-12) break;
        }
        return E;
    }

    // Propaga os elementos por dt segundos (dois corpos, órbitas elípticas).
    public static OrbitalElements Propagate(OrbitalElements oe, double mu, double dt)
    {
        double e = oe.Eccentricity;
        double nu = oe.TrueAnomaly;
        double E = 2 * Math.Atan2(Math.Sqrt(1 - e) * Math.Sin(nu / 2), Math.Sqrt(1 + e) * Math.Cos(nu / 2));
        double M = E - e * Math.Sin(E);
        M += oe.MeanMotion * dt;
        E = SolveKepler(M, e);
        double nuNew = 2 * Math.Atan2(Math.Sqrt(1 + e) * Math.Sin(E / 2), Math.Sqrt(1 - e) * Math.Cos(E / 2));
        if (nuNew < 0) nuNew += 2 * Math.PI;
        return new OrbitalElements
        {
            SemiMajorAxis = oe.SemiMajorAxis, Eccentricity = e, Inclination = oe.Inclination,
            RightAscension = oe.RightAscension, ArgumentOfPeriapsis = oe.ArgumentOfPeriapsis,
            TrueAnomaly = nuNew, Epoch = oe.Epoch + dt, MeanMotion = oe.MeanMotion
        };
    }

    // Aceleração da perturbação J2 (m/s^2) na posição r (frame ECI).
    public static Vector3d J2Acceleration(Vector3d r)
    {
        double rm2 = r.MagnitudeSquared;
        double rm = Math.Sqrt(rm2);
        double rm5 = rm2 * rm2 * rm;
        double c = -1.5 * Constants.EarthJ2 * Constants.EarthMu * Constants.EarthRadius * Constants.EarthRadius / rm5;
        double z2 = r.Z * r.Z;
        return new Vector3d(
            c * r.X * (1.0 - 5.0 * z2 / rm2),
            c * r.Y * (1.0 - 5.0 * z2 / rm2),
            c * r.Z * (3.0 - 5.0 * z2 / rm2));
    }

    static double Clamp(double v, double min, double max) => v < min ? min : v > max ? max : v;
    static double WrapTwoPi(double a) { a %= 2 * Math.PI; if (a < 0) a += 2 * Math.PI; return a; }
}
