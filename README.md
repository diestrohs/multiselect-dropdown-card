# Multiselect Dropdown Card

Eine Home Assistant Custom Card für Mehrfachauswahl mit Dropdown-Funktionalität und visuellem Editor.

## Features

- ✅ Dropdown-Menü mit Mehrfachauswahl
- ✅ Unterstützung für Input Boolean Entities
- ✅ Visueller Editor zur Konfiguration
- ✅ Item-Management (Hinzufügen, Bearbeiten, Löschen)
- ✅ Responsive Design
- ✅ Automatische Dropdown-Positionierung (oben/unten)
- ✅ Optionale Zusammenfassung von Selections (z.B. "Mo, Di, Mi" oder "Mo – Mi")
- ✅ Anpassbare Icons und Farben

## Installation

Datei `multiselect-dropdown-card.js` zu Ihrer Home Assistant `www` Ordner hinzufügen.

## Konfiguration

### Via Visueller Editor
Die Card kann vollständig über den visuellen Editor in Home Assistant konfiguriert werden:
- **Name**: Titel der Card
- **Icon**: Icon-Auswahl (mdi-Icons)
- **Icon Farbe**: Hexadezimal-Farbcode (z.B. #44739e)
- **Zusammenfassen**: Toggle für Zusammenfassung der Selections
- **Items**: Verwaltung der Dropdown-Items mit Dialog-Editor

### Via YAML

```yaml
type: custom:multiselect-dropdown
name: Wochentage
icon: mdi:calendar-expand-horizontal-outline
icon_color: "#44739e"
item_summarize: true
items:
  - name: Montag
    short: Mo
    entity: input_boolean.irrigation_monday
  - name: Dienstag
    short: Di
    entity: input_boolean.irrigation_tuesday
  - name: Mittwoch
    short: Mi
    entity: input_boolean.irrigation_wednesday
  - name: Donnerstag
    short: Do
    entity: input_boolean.irrigation_thursday
  - name: Freitag
    short: Fr
    entity: input_boolean.irrigation_friday
  - name: Samstag
    short: Sa
    entity: input_boolean.irrigation_saturday
  - name: Sonntag
    short: So
    entity: input_boolean.irrigation_sunday
```

## Item-Editor

### Neue Items hinzufügen
1. Klick auf **"+ Item hinzufügen"** Button
2. Dialog öffnet sich mit Eingabefeldern
3. Füllen Sie aus:
   - **Name**: Vollanzeige im Dropdown
   - **Kurz (short)**: Kurzform für Zusammenfassung
   - **Entity**: Input Boolean Entity ID
4. **Speichern** - Item wird zur Liste hinzugefügt

### Items bearbeiten
1. Klick auf **Stift-Icon** neben dem Item
2. Item-Eintrag wird durch Dialog ersetzt
3. Änderungen durchführen
4. **Speichern** - Item wird aktualisiert
5. **Abbrechen** - Änderungen verwerfen

### Items löschen
- Klick auf **X-Icon** neben dem Item
- Item wird sofort entfernt

## Eigenschaften

| Property | Type | Erforderlich | Standard | Beschreibung |
|----------|------|--------------|----------|-------------|
| name | string | Nein | "Auswahl" | Titel der Card |
| icon | string | Nein | "mdi:calendar" | MDI Icon |
| icon_color | string | Nein | - | Hex-Farbcode |
| item_summarize | boolean | Nein | false | Zusammenfassung aktivieren |
| items | array | Ja | [] | Array von Item-Objekten |

### Item-Objekt

| Property | Type | Erforderlich | Beschreibung |
|----------|------|--------------|-------------|
| name | string | Ja | Name im Dropdown |
| short | string | Nein | Kurzform für Zusammenfassung |
| entity | string | Ja | Input Boolean Entity ID |

## Zusammenfassung-Modus

Wenn `item_summarize: true`:
- **Einzelne Items**: Anzeige der Kurznamen mit Komma (z.B. "Mo, Di, Fr")
- **Bereiche (3+ Items)**: Automatische Bereichszusammenfassung (z.B. "Mo – Fr, So")
- Fallback auf Vollnamen, wenn `short` nicht definiert

## Design-Eigenschaften

- **Button-Höhe**: 40px
- **Button-Breite**: 50% der Card
- **Item-Höhe**: 40px
- **Icon**: Wechsel zwischen `mdi:menu-down` (geschlossen) und `mdi:menu-up` (offen)
- **Icon-Opacity**: 0.6 (normal), 1.0 (offen) mit Primärfarbe
- **Hover-Effekt**: Weiße Overlay auf Button und Items

## Anforderungen

- Home Assistant 2024.x oder höher
- Input Boolean Entities

## Lizenz

Siehe LICENSE Datei
