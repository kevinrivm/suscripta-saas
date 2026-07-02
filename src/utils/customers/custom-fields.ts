export const CUSTOM_FIELD_KEYS = ['field_1', 'field_2', 'field_3', 'field_4'] as const;

export type CustomFieldKey = typeof CUSTOM_FIELD_KEYS[number];

export type CustomFieldDefinition = {
  key: CustomFieldKey;
  label: string;
  position: number;
};

export type CustomFieldValues = Partial<Record<CustomFieldKey, string>>;

const CUSTOM_FIELD_KEY_SET = new Set<string>(CUSTOM_FIELD_KEYS);
const MAX_LABEL_LENGTH = 40;
const MAX_VALUE_LENGTH = 500;

export function isCustomFieldKey(value: string): value is CustomFieldKey {
  return CUSTOM_FIELD_KEY_SET.has(value);
}

export function sanitizeCustomFieldLabel(label: unknown): string {
  return String(label ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LABEL_LENGTH);
}

export function buildCustomFieldDefinitions(labels: unknown[]): CustomFieldDefinition[] {
  const seen = new Set<string>();
  const cleanLabels = labels
    .map(sanitizeCustomFieldLabel)
    .filter((label) => {
      if (!label) return false;
      const normalized = label.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, CUSTOM_FIELD_KEYS.length);

  return cleanLabels.map((label, index) => ({
    key: CUSTOM_FIELD_KEYS[index],
    label,
    position: index + 1,
  }));
}

export function normalizeCustomFieldDefinitions(input: unknown): CustomFieldDefinition[] {
  if (!Array.isArray(input)) return [];

  const usedKeys = new Set<string>();
  const normalized = input
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Partial<CustomFieldDefinition>;
      const key = typeof raw.key === 'string' && isCustomFieldKey(raw.key)
        ? raw.key
        : CUSTOM_FIELD_KEYS[index];
      const label = sanitizeCustomFieldLabel(raw.label);
      const rawPosition = raw.position;
      const position = typeof rawPosition === 'number' && Number.isInteger(rawPosition) && rawPosition > 0
        ? rawPosition
        : index + 1;

      if (!key || !label || usedKeys.has(key)) return null;
      usedKeys.add(key);
      return { key, label, position };
    })
    .filter((definition): definition is CustomFieldDefinition => Boolean(definition))
    .sort((a, b) => a.position - b.position)
    .slice(0, CUSTOM_FIELD_KEYS.length);

  return normalized.map((definition, index) => ({
    key: CUSTOM_FIELD_KEYS[index],
    label: definition.label,
    position: index + 1,
  }));
}

export function sanitizeCustomFieldValues(
  values: unknown,
  definitions: CustomFieldDefinition[],
): CustomFieldValues {
  if (!values || typeof values !== 'object' || definitions.length === 0) return {};

  const rawValues = values as Record<string, unknown>;
  return definitions.reduce<CustomFieldValues>((acc, definition) => {
    const rawValue = rawValues[definition.key];
    const value = String(rawValue ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_VALUE_LENGTH);

    if (value) acc[definition.key] = value;
    return acc;
  }, {});
}

export function customFieldDefinitionsEqual(
  a: CustomFieldDefinition[],
  b: CustomFieldDefinition[],
): boolean {
  if (a.length !== b.length) return false;

  return a.every((definition, index) => (
    definition.key === b[index]?.key
    && definition.label === b[index]?.label
    && definition.position === b[index]?.position
  ));
}
