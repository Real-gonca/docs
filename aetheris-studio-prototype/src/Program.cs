using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using Aetheris.Core;
using Aetheris.Flight;
using Aetheris.Link;

namespace Aetheris.Prototype;

internal static class Program
{
    private static Spacecraft? craft;
    private static OrbitalElements? orbit0;
    private static GroundStation? station;
    private static FlightEngine? engine;
    private static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

    private static void Main()
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.Title = "Aetheris Space Studio — Protótipo Unificado (C#)";
        bool run = true;
        while (run)
        {
            DrawHeader();
            WriteLine("1 - Configurar e dimensionar espaçonave (Tsiolkovsky, TWR, orçamento de massa)");
            WriteLine("2 - Prever órbita (propagador dois-corpo + perturbação J2)");
            WriteLine("3 - Contato com estação terrestre (janela de acesso + orçamento de enlace)");
            WriteLine("4 - MODO VOO TEMPO REAL — assumir o controle do empuxo");
            WriteLine("0 - Sair");
            Write("Escolha: ");
            string? op = Console.ReadLine();
            switch (op)
            {
                case "1": ConfigureCraft(); break;
                case "2": PredictOrbit(); break;
                case "3": CheckContact(); break;
                case "4": RealTimeFlight(); break;
                case "0": run = false; break;
                default: WriteLine("Opção inválida."); Pause(); break;
            }
        }
    }

    /* ====================== MODO 1: Dimensionamento ====================== */
    static void ConfigureCraft()
    {
        DrawHeader();
        WriteLine("--- Configuração de Propulsão e Dimensionamento ---");
        string name = ReadString("Nome da nave", "Aetheris-1");
        double isp = ReadDouble("Impulso específico do motor (s)", 310);
        double thrust = ReadDouble("Empuxo (N)", 350_000);
        double dry = ReadDouble("Massa seca do estágio (kg)", 6_000);
        double prop = ReadDouble("Massa de propelente (kg)", 24_000);
        double payload = ReadDouble("Carga útil (kg)", 1_500);

        var engineSpec = new EngineSpec
        {
            Name = "Estágio 1", ThrustN = thrust, IspS = isp,
            DryMassKg = dry, PropellantMassKg = prop
        };
        var budget = PropulsionMath.Budget(engineSpec, payload, fullBurn: true);

        craft = new Spacecraft
        {
            Name = name, PayloadMassKg = payload,
            Stages = { engineSpec },
            ActiveStageIndex = 0,
            PropellantRemainingKg = prop
        };

        WriteLine("\n--- Orçamento de massa e potência (resultado) ---");
        WriteLine($"Massa inicial       : {budget.InitialMassKg:N1} kg");
        WriteLine($"Massa final         : {budget.FinalMassKg:N1} kg");
        WriteLine($"Propelente          : {budget.PropellantConsumedKg:N1} kg");
        WriteLine($"Δv total (Tsiolkovsky): {budget.DeltaVMS:N1} m/s");
        WriteLine($"Empuxo-peso (TWR)   : {budget.ThrustToWeightRatio:N3}");
        WriteLine($"Aceleração inicial  : {budget.AccelerationMS2:N2} m/s²");
        WriteLine($"Tempo de queima     : {budget.BurnTimeS:N1} s");
        WriteLine("\nConfiguração salva. Use a opção 2 para propagar a órbita.");
        Pause();
    }

    /* ====================== MODO 2: Predição de órbita ====================== */
    static void PredictOrbit()
    {
        DrawHeader();
        WriteLine("--- Predição de Órbita (dois-corpo + J2) ---");
        double altKm = ReadDouble("Altitude inicial circular (km)", 400);
        double incDeg = ReadDouble("Inclinação (graus)", 28.5);
        double predictMin = ReadDouble("Tempo de predição (minutos)", 270);

        double mu = Constants.EarthMu;
        double r = Constants.EarthRadius + altKm * 1000;
        double v = Math.Sqrt(mu / r);
        double inc = incDeg * Math.PI / 180;

        // Órbita circular inclinada. Semieixo e movimento médio são derivados do raio da órbita.
        var elements = new OrbitalElements
        {
            SemiMajorAxis = r, Eccentricity = 0, Inclination = inc,
            RightAscension = 0, ArgumentOfPeriapsis = 0, TrueAnomaly = 0,
            Epoch = 0, MeanMotion = Math.Sqrt(mu / (r * r * r))
        };
        orbit0 = elements;

        double periodS = elements.Period;
        double steps = 120;
        double dt = predictMin * 60 / steps;
        WriteLine($"\nPeríodo orbital: {periodS / 60:N2} min | Passo de propagação: {dt:N1} s");
        WriteLine(new string('-', 92));
        WriteLine($"   t(min)     Altitude(km)    Vel(m/s)     Semieixo(km)   e       i(°)     ν(°)");
        WriteLine(new string('-', 92));
        var oe = elements;
        for (int k = 0; k <= steps; k++)
        {
            double t = k * dt;
            var (pos, vel) = OrbitalMath.ElementsToRv(oe, mu);
            double alt = pos.Magnitude - Constants.EarthRadius;
            if (k % 10 == 0)
            {
                WriteLine($"  {t / 60,7:N2}  {alt / 1000,11:N2}  {vel.Magnitude,10:N1}  {oe.SemiMajorAxis / 1000,12:N2}  {oe.Eccentricity,6:N4}  {oe.Inclination * 180 / Math.PI,7:N2}  {oe.TrueAnomaly * 180 / Math.PI,7:N2}");
            }
            oe = OrbitalMath.Propagate(oe, mu, dt);
        }
        WriteLine("\nÓrbita prevista salva. Use a opção 3 para verificar o contato com a estação terrestre.");
        Pause();
    }

    /* ====================== MODO 3: Contato com estação terrestre ====================== */
    static void CheckContact()
    {
        if (orbit0 == null)
        {
            WriteLine("Execute primeiro a predição de órbita (opção 2).");
            Pause();
            return;
        }

        DrawHeader();
        WriteLine("--- Contato com Estação Terrestre ---");
        var gs = new GroundStation
        {
            Name = "Estação Nova Vida", LatitudeDeg = -8.84, LongitudeDeg = 13.24,
            AltitudeM = 500, MinElevationDeg = 5.0, FrequencyHz = 2.2e9,
            TransmitPowerW = 20.0, TxGainDbi = 25.0, RxGainDbi = 25.0,
            SystemLossDb = 3.0, BandwidthHz = 2_500_000
        };
        gs.LatitudeDeg = ReadDouble("Latitude da estação (°)", gs.LatitudeDeg);
        gs.LongitudeDeg = ReadDouble("Longitude da estação (°)", gs.LongitudeDeg);
        gs.MinElevationDeg = ReadDouble("Elevação mínima (°)", gs.MinElevationDeg);
        station = gs;

        double mu = Constants.EarthMu;
        double period = orbit0.Period;
        double dt = 30.0;
        int steps = (int)(3 * period / dt);

        var windows = new List<(double Start, double End, double MaxElev, double MinRange)>();
        bool inAccess = false;
        double startT = 0, bestElev = -999, bestRange = double.MaxValue, bestT = 0;

        for (int k = 0; k <= steps; k++)
        {
            double t = k * dt;
            var oek = OrbitalMath.Propagate(orbit0, mu, t);
            var (pos, _) = OrbitalMath.ElementsToRv(oek, mu);
            double gst = Constants.EarthRotationRadPerS * t;
            var ecef = EciToEcef(pos, gst);
            var acc = gs.Topocentric(ecef, gst);
            bool access = acc.HasAccess;

            if (access && !inAccess)
            {
                inAccess = true; startT = t; bestElev = -999; bestRange = double.MaxValue;
            }
            if (access)
            {
                if (acc.ElevationDeg > bestElev) { bestElev = acc.ElevationDeg; bestRange = acc.RangeKm; bestT = t; }
            }
            if ((!access || k == steps) && inAccess)
            {
                double endT = (k == steps && access) ? t : t;
                windows.Add((startT, endT, bestElev, bestRange));
                inAccess = false;
            }
        }

        WriteLine($"\nJanelas de acesso encontradas: {windows.Count}");
        WriteLine(new string('-', 72));
        WriteLine($"  Início       Fim          Duração(s)   Elevação Máx(°) Alcance Mín(km)");
        WriteLine(new string('-', 72));
        foreach (var w in windows)
        {
            WriteLine($"  {FormatTime(w.Start)}  {FormatTime(w.End)}  {(w.End - w.Start),9:N0}  {w.MaxElev,11:N2}  {w.MinRange,12:N2}");
        }

        if (windows.Count > 0)
        {
            var best = windows.OrderByDescending(w => w.MaxElev).First();
            double gst = Constants.EarthRotationRadPerS * best.Start;
            var oeb = OrbitalMath.Propagate(orbit0, mu, best.Start);
            var (posB, _) = OrbitalMath.ElementsToRv(oeb, mu);
            var ecefB = EciToEcef(posB, gst);
            var rangeKm = gs.Topocentric(ecefB, gst).RangeKm;
            var link = gs.LinkBudget(rangeKm);

            WriteLine($"\nMelhor contato: início {FormatTime(best.Start)}, elevação {best.MaxElev:N1}°, alcance {best.MinRange:N1} km");
            WriteLine("--- Orçamento de enlace no melhor contato ---");
            WriteLine($"Perda no espaço livre : {link.FsplDb:N2} dB");
            WriteLine($"Potência recebida     : {link.ReceivedPowerDbw:N2} dBW");
            WriteLine($"SNR                   : {link.SnrDb:N2} dB");
            WriteLine($"Taxa de dados (Shannon): {link.EstimatedDataRateBps / 1e6:N2} Mbps");
        }

        WriteLine("\nDados da estação salvos. Use a opção 4 para voar em tempo real.");
        Pause();
    }

    static Vector3d EciToEcef(Vector3d r, double gst)
    {
        double c = Math.Cos(gst), s = Math.Sin(gst);
        return new Vector3d(c * r.X - s * r.Y, s * r.X + c * r.Y, r.Z);
    }

    /* ====================== MODO 4: Voo tempo real ====================== */
    static void RealTimeFlight()
    {
        if (craft == null || orbit0 == null)
        {
            WriteLine("Configure a nave (1) e preveja a órbita (2) antes de voar.");
            Pause();
            return;
        }

        station ??= new GroundStation
        {
            Name = "Sem estação configurada", LatitudeDeg = -8.84, LongitudeDeg = 13.24,
            AltitudeM = 500, MinElevationDeg = 5.0
        };

        DrawHeader();
        WriteLine("--- MODO VOO TEMPO REAL: ASSUMIR O CONTROLE ---");
        WriteLine($"Nave: {craft.Name}");
        WriteLine($"Empuxo disponível: {craft.Stages[0].ThrustN:N0} N | Δv restante: {craft.DeltaVRemainingMS:N1} m/s");
        WriteLine($"Combustível: {craft.PropellantRemainingKg:N1} kg | Massa total: {craft.TotalMassKg:N1} kg");
        WriteLine("Controles: W/S = empuxo ±10% | 0-9 = empuxo direto (0.1-0.9) | Q = devolver controle");
        WriteLine("A simulação avança 1 s por quadro (5 sub-passos de 0,2 s). Direção de empuxo: pró-grada.");
        Pause();

        var (r0, v0) = OrbitalMath.ElementsToRv(orbit0, Constants.EarthMu);
        engine = new FlightEngine(craft, station, r0, v0) { Dt = 0.2 };
        double thrustFraction = 0;
        const int subSteps = 5;

        while (engine.IsFlying)
        {
            if (Console.KeyAvailable)
            {
                var key = Console.ReadKey(true).Key;
                switch (key)
                {
                    case ConsoleKey.W: thrustFraction = Math.Min(1.0, thrustFraction + 0.1); break;
                    case ConsoleKey.S: thrustFraction = Math.Max(0.0, thrustFraction - 0.1); break;
                    case ConsoleKey.Q: engine.IsFlying = false; break;
                    case ConsoleKey.D0: thrustFraction = 0; break;
                    case ConsoleKey.D1: thrustFraction = 0.1; break;
                    case ConsoleKey.D2: thrustFraction = 0.2; break;
                    case ConsoleKey.D3: thrustFraction = 0.3; break;
                    case ConsoleKey.D4: thrustFraction = 0.4; break;
                    case ConsoleKey.D5: thrustFraction = 0.5; break;
                    case ConsoleKey.D6: thrustFraction = 0.6; break;
                    case ConsoleKey.D7: thrustFraction = 0.7; break;
                    case ConsoleKey.D8: thrustFraction = 0.8; break;
                    case ConsoleKey.D9: thrustFraction = 0.9; break;
                }
            }

            engine.ThrustFraction = thrustFraction;
            for (int i = 0; i < subSteps; i++) engine.Step();
            double gst = Constants.EarthRotationRadPerS * engine.SimTimeS;
            var tel = engine.Snapshot(gst);
            PrintMfd(tel, engine.IsFlying);
            Thread.Sleep(300);
        }

        DrawHeader();
        WriteLine(!engine.IsFlying ? "IMPACTO / REENTRADA detectada. Fim da simulação." : "Controle devolvido ao planejador.");
        Pause();
    }

    static void PrintMfd(TelemetrySnapshot t, bool flying)
    {
        Console.Clear();
        WriteLine("==========================================================================");
        WriteLine(" MFD-1: MAPA ORBITAL                     MFD-2: GNC / ATITUDE             ");
        WriteLine("==========================================================================");
        WriteLine($" Tempo de missão   : {FormatTime(t.SimTimeS)}");
        WriteLine($" Altitude            : {t.AltitudeM / 1000:N2} km");
        WriteLine($" Velocidade          : {t.SpeedMS:N1} m/s");
        WriteLine($" Massa total         : {t.MassKg:N1} kg");
        WriteLine($" Δv restante         : {t.DeltaVRemainingMS:N1} m/s");
        WriteLine($" Empuxo manual       : {t.ThrustFraction * 100:N0} %   (W/S para alterar)");
        WriteLine($" Subponto            : {t.GsLatDeg:N3}° lat, {t.GsLonDeg:N3}° lon");
        if (t.HasAccess)
            WriteLine($" Contato estação     : SIM — Elevação {t.ElevationDeg:N1}°, Azimute {t.AzimuthDeg:N1}°, Alcance {t.RangeKm:N1} km");
        else
            WriteLine($" Contato estação     : FORA DE VISÃO");
        WriteLine($" Estado              : {(flying ? "VOANDO" : "PAUSADO PELO USUÁRIO")}");
        WriteLine("--------------------------------------------------------------------------");
        WriteLine(" W/S ±10% empuxo  |  0-9 empuxo direto  |  Q devolver controle ao planejador");
    }

    /* ====================== Utilitários ====================== */
    static void DrawHeader()
    {
        Console.Clear();
        WriteLine("==========================================================================");
        WriteLine("               AETHERIS SPACE STUDIO — PROTÓTIPO UNIFICADO (C#)           ");
        WriteLine("          Fusão dos núcleos GMAT + STK + Orbiter — estado canônico único   ");
        WriteLine("==========================================================================");
    }

    static void WriteLine(string? s = "") => Console.WriteLine(s);
    static void Write(string s) => Console.Write(s);
    static void Pause()
    {
        Write("\nPressione ENTER para continuar... ");
        Console.ReadLine();
    }

    static string FormatTime(double seconds)
    {
        var ts = TimeSpan.FromSeconds(seconds);
        return ts.ToString(@"hh\:mm\:ss");
    }

    static double ReadDouble(string prompt, double def)
    {
        Write($"{prompt} [{def}]: ");
        var s = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(s)) return def;
        return double.TryParse(s, NumberStyles.Any, Inv, out var v) ? v : def;
    }

    static string ReadString(string prompt, string def)
    {
        Write($"{prompt} [{def}]: ");
        var s = Console.ReadLine();
        return string.IsNullOrWhiteSpace(s) ? def : s;
    }
}
