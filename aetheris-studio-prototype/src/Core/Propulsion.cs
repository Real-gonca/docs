namespace Aetheris.Core;

public sealed class EngineSpec
{
    public string Name { get; set; } = "Motor";
    public double ThrustN { get; set; }
    public double IspS { get; set; }            // impulso específico, s
    public double DryMassKg { get; set; }        // motor + estrutura do estágio
    public double PropellantMassKg { get; set; }
    public double MassFlowKgPerS => ThrustN / (IspS * Constants.StandardGravity);
    public double TotalStageMassKg => DryMassKg + PropellantMassKg;
}

public sealed class PropulsionBudget
{
    public double InitialMassKg { get; set; }
    public double FinalMassKg { get; set; }
    public double PropellantConsumedKg { get; set; }
    public double DeltaVMS { get; set; }
    public double ThrustToWeightRatio { get; set; }
    public double BurnTimeS { get; set; }
    public double AccelerationMS2 { get; set; }
}

public static class PropulsionMath
{
    public static double DeltaVTsiolkovsky(double ispS, double m0, double mf) =>
        ispS * Constants.StandardGravity * Math.Log(m0 / mf);

    public static PropulsionBudget Budget(EngineSpec engine, double payloadMassKg, bool fullBurn)
    {
        double m0 = payloadMassKg + engine.TotalStageMassKg;
        double mf = payloadMassKg + engine.DryMassKg;
        double dv = DeltaVTsiolkovsky(engine.IspS, m0, mf);
        double twr = engine.ThrustN / (m0 * Constants.StandardGravity);
        double burnTime = fullBurn ? engine.PropellantMassKg / engine.MassFlowKgPerS : 0;
        return new PropulsionBudget
        {
            InitialMassKg = m0, FinalMassKg = mf,
            PropellantConsumedKg = fullBurn ? engine.PropellantMassKg : 0,
            DeltaVMS = dv, ThrustToWeightRatio = twr, BurnTimeS = burnTime,
            AccelerationMS2 = engine.ThrustN / m0
        };
    }
}
