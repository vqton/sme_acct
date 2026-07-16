using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Rules;

public class RegulatoryRule : BaseEntity
{
    public string RuleCode { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string RuleType { get; private set; } = string.Empty;
    public string JsonConfig { get; private set; } = string.Empty;
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public bool IsActive { get; private set; } = true;

    private RegulatoryRule() { }

    public RegulatoryRule(string ruleCode, string name, string ruleType, string jsonConfig, DateOnly effectiveFrom)
    {
        RuleCode = ruleCode;
        Name = name;
        RuleType = ruleType;
        JsonConfig = jsonConfig;
        EffectiveFrom = effectiveFrom;
    }

    public void Deactivate() => IsActive = false;
    public void UpdateConfig(string jsonConfig) => JsonConfig = jsonConfig;
    public void SetExpiry(DateOnly effectiveTo) => EffectiveTo = effectiveTo;
}
