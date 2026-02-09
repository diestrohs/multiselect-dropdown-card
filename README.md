# Multiselect Dropdown Card

Eine Home Assistant Custom Card für Mehrfachauswahl mit Dropdown-Funktionalität und visuellem Editor.

## Features

- ✅ Dropdown-Menü mit Mehrfachauswahl
- ✅ Unterstützung für Input Boolean Entities
- ✅ Visueller Editor zur Konfiguration
- ✅ Optionen-Management (Hinzufügen, Bearbeiten, Löschen)
- ✅ Responsive Design
- ✅ Automatische Dropdown-Positionierung (öffnet immer in Richtung mit mehr Platz)
✅ Kein Flackern mehr im Button-Text nach Speichern
- ✅ Optionale Zusammenfassung von Selections (z.B. "Mo, Di, Mi" oder "Mo – Mi")
- ✅ Anpassbare Icons und Farben

## Installation

Datei `multiselect-dropdown-card.js` zu Ihrer Home Assistant `www` Ordner hinzufügen.

## Konfiguration

### Via Visueller Editor
Die Card kann vollständig über den visuellen Editor in Home Assistant konfiguriert werden:
**Label**: Titel der Card
- **Icon**: Icon-Auswahl (mdi-Icons)
- **Icon Farbe**: Hexadezimal-Farbcode (z.B. #44739e)
- **Zusammenfassen**: Toggle für Zusammenfassung der Selections
- **Optionen**: Verwaltung der Dropdown-Optionen mit Dialog-Editor

### Via YAML


### Beispiel: Boolean-Modus (Standard)
```yaml
type: custom:multiselect-dropdown
name: Wochentage
icon: mdi:calendar-expand-horizontal-outline
icon_color: "#44739e"
item_summarize: true
mode: boolean   # optional, default
options:
  - label: Montag
    entity: input_boolean.irrigation_monday
  - label: Dienstag
    entity: input_boolean.irrigation_tuesday
  - label: Mittwoch
    entity: input_boolean.irrigation_wednesday
  - label: Donnerstag
    entity: input_boolean.irrigation_thursday
  - label: Freitag
    entity: input_boolean.irrigation_friday
  - label: Samstag
    entity: input_boolean.irrigation_saturday
  - label: Sonntag
    entity: input_boolean.irrigation_sunday
```

### Beispiel: Text-Modus (input_text)
```yaml
type: custom:multiselect-dropdown
name: Wochentage
icon: mdi:calendar-expand-horizontal-outline
icon_color: "#44739e"
item_summarize: true
mode: text
text_entity: input_text.irrigation_days
options:
  - label: Montag
    value: mon
  - label: Dienstag
    value: tue
  - label: Mittwoch
    value: wed
  - label: Donnerstag
    value: thu
  - label: Freitag
    value: fri
  - label: Samstag
    value: sat
  - label: Sonntag
    value: sun
```

Im Text-Modus werden die ausgewählten Werte kommasepariert in die text_entity geschrieben, z. B.: `mon,tue,wed,fri`

## Optionen-Editor

### Neue Optionen hinzufügen
1. Klick auf **"+ Option hinzufügen"** Button
2. Dialog öffnet sich mit Eingabefeldern
3. Füllen Sie aus:
  - **Label**: Text im Dropdown
  - **Entity**: Input Boolean Entity ID (nur Boolean-Modus)
  - **Value**: Wert für Text-Modus
4. **Speichern** - Option wird zur Liste hinzugefügt

### Optionen bearbeiten
1. Klick auf **Stift-Icon** neben der Option
2. Eintrag wird durch Dialog ersetzt
3. Änderungen durchführen (Label, Entity oder Value)
4. **Speichern** - Option wird aktualisiert
5. **Abbrechen** - Änderungen verwerfen

### Optionen löschen
- Klick auf **X-Icon** neben der Option
- Option wird sofort entfernt

## Eigenschaften

| Property | Type | Erforderlich | Standard | Beschreibung |
|----------|------|--------------|----------|-------------|
| name | string | Nein | "Auswahl" | Titel der Card |
| icon | string | Nein | "mdi:calendar" | MDI Icon |
| icon_color | string | Nein | - | Hex-Farbcode |
| item_summarize | boolean | Nein | false | Zusammenfassung aktivieren |
| options | array | Ja | [] | Array von Optionen-Objekten |

### Optionen-Objekt

| Property | Type | Erforderlich | Beschreibung |
|----------|------|--------------|-------------|
| label | string | Ja | Text im Dropdown |
| entity | string | Ja (nur boolean) | Input Boolean Entity ID |
| value | string | Ja (nur text) | Wert, der in text_entity geschrieben wird |

## State-Handling und Bedienung
- Dropdown öffnet immer in die Richtung mit mehr verfügbarem Platz (oben/unten)
- Nach dem Speichern werden Änderungen sofort übernommen, kein Flackern mehr im Button-Text

- Änderungen an Checkboxen im Dropdown werden sofort im Button angezeigt ("pending state")
- Die tatsächlichen Home Assistant States werden erst beim Schließen des Dropdowns übernommen (Batch-Commit)
- Klick auf Checkbox oder Zeile toggelt den pending state
- Die Anzeige im Button bleibt immer synchron zu den aktuellen Auswahländerungen
- Es gibt **keine** Autovervollständigung für Entity, sondern ein einfaches Textfeld

## Zusammenfassung-Logik

- **Einzelne Optionen**: Name/Kurzname
- **Zwei aufeinanderfolgende Optionen**: Mit Komma getrennt (z.B. "Mo, Di")
- **Drei oder mehr aufeinanderfolgende Optionen**: Bereich mit Gedankenstrich (z.B. "Mo – Mi")
- Nicht zusammenhängende Bereiche werden mit Komma getrennt (z.B. "Mo – Mi, Fr, So")

## Design-Eigenschaften

- **Button-Höhe**: 40px
- **Button-Breite**: 50% der Card
- **Item-Höhe**: 40px
- **Icon**: Wechsel zwischen `mdi:menu-down` (geschlossen) und `mdi:menu-up` (offen)
- **Icon-Opacity**: 0.6 (normal), 1.0 (offen) mit Primärfarbe
- **Hover-Effekt**: Weiße Overlay auf Button und Optionen

## Anforderungen

- Home Assistant 2024.x oder höher
- Für Text-Modus: input_text-Entity erforderlich

## Lizenz

Siehe LICENSE Datei
