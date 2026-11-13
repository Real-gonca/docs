using System;
using System.Collections.Generic;

namespace Aetheris.Core;

public sealed class Spacecraft
{
    public string Name { get; set; } = "Nave";
    public double PayloadMassKg { get; set; }
    public List<EngineSpec> Stages { get; } = new();
    public int ActiveStageIndex { get; set; }
    public double PropellantRemainingKg { get; set; }
    public Vector3d ThrustDirection { get; set; } = Vector3d.UnitZ;

    public double TotalMassKg
    {
        get
        {
            double stages = 0;
            for (int i = 0; i < Stages.Count; i++)
            {
                if (i < ActiveStageIndex) continue; // estágio já desacoplado
                stages += i == ActiveStageIndex
                    ? Stages[i].DryMassKg + PropellantRemainingKg
                    : Stages[i].TotalStageMassKg;
            }
            return PayloadMassKg + stages;
        }
    }

    public double DeltaVRemainingMS
    {
        get
        {
            if (Stages.Count == 0 || ActiveStageIndex >= Stages.Count) return 0;
            var e = Stages[ActiveStageIndex];
            double m0 = TotalMassKg, mf = TotalMassKg - PropellantRemainingKg;
            return mf > 0 && m0 > 0 ? PropulsionMath.DeltaVTsiolkovsky(e.IspS, m0, mf) : 0;
        }
    }

    public Vector3d ThrustAcceleration(double fraction)
    {
        if (Stages.Count == 0 || ActiveStageIndex >= Stages.Count) return Vector3d.Zero;
        var e = Stages[ActiveStageIndex];
        double f = fraction < 0 ? 0 : fraction > 1 ? 1 : fraction;
        return e.ThrustN * f / TotalMassKg * ThrustDirection.Normalized;
    }

    public void ConsumePropellant(double fraction, double dt)
    {
        if (Stages.Count == 0 || ActiveStageIndex >= Stages.Count) return;
        var e = Stages[ActiveStageIndex];
        double f = fraction < 0 ? 0 : fraction > 1 ? 1 : fraction;
        double consumed = e.ThrustN * f / (e.IspS * Constants.StandardGravity) * dt;
        consumed = Math.Min(consumed, PropellantRemainingKg);
        PropellantRemainingKg -= consumed;
        if (PropellantRemainingKg <= 1e-6 && ActiveStageIndex + 1 < Stages.Count)
        {
            ActiveStageIndex++; // estágio esgotado: desacopla e avança (simplificado)
            PropellantRemainingKg = Stages[ActiveStageIndex].PropellantMassKg;
        }
    }
}
