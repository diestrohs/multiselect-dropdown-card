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


### Beispiel: Boolean-Modus (Standard)
```yaml
type: custom:multiselect-dropdown
name: Wochentage
icon: mdi:calendar-expand-horizontal-outline
icon_color: "#44739e"
item_summarize: true
mode: boolean   # optional, default
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

### Beispiel: Text-Modus (input_text)
```yaml
type: custom:multiselect-dropdown
name: Wochentage
icon: mdi:calendar-expand-horizontal-outline
icon_color: "#44739e"
item_summarize: true
mode: text
text_entity: input_text.irrigation_days
items:
  - name: Montag
    short: Mo
    value: mon
  - name: Dienstag
    short: Di
    value: tue
  - name: Mittwoch
    short: Mi
    value: wed
  - name: Donnerstag
    short: Do
    value: thu
  - name: Freitag
    short: Fr
    value: fri
  - name: Samstag
    short: Sa
    value: sat
  - name: Sonntag
    short: So
    value: sun
```

Im Text-Modus werden die ausgewählten Werte kommasepariert in die text_entity geschrieben, z. B.: `mon,tue,wed,fri`

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
| entity | string | Ja (nur boolean) | Input Boolean Entity ID |
| value | string | Ja (nur text) | Wert, der in text_entity geschrieben wird |

## State-Handling und Bedienung

- Änderungen an Checkboxen im Dropdown werden sofort im Button angezeigt ("pending state")
- Die tatsächlichen Home Assistant States werden erst beim Schließen des Dropdowns übernommen (Batch-Commit)
- Klick auf Checkbox oder Zeile toggelt den pending state
- Die Anzeige im Button bleibt immer synchron zu den aktuellen Auswahländerungen
- Es gibt **keine** Autovervollständigung für Entity, sondern ein einfaches Textfeld

## Zusammenfassung-Logik

- **Einzelne Items**: Name/Kurzname
- **Zwei aufeinanderfolgende Items**: Mit Komma getrennt (z.B. "Mo, Di")
- **Drei oder mehr aufeinanderfolgende Items**: Bereich mit Gedankenstrich (z.B. "Mo – Mi")
- Nicht zusammenhängende Bereiche werden mit Komma getrennt (z.B. "Mo – Mi, Fr, So")

## Design-Eigenschaften

- **Button-Höhe**: 40px
- **Button-Breite**: 50% der Card
- **Item-Höhe**: 40px
- **Icon**: Wechsel zwischen `mdi:menu-down` (geschlossen) und `mdi:menu-up` (offen)
- **Icon-Opacity**: 0.6 (normal), 1.0 (offen) mit Primärfarbe
- **Hover-Effekt**: Weiße Overlay auf Button und Items

## Anforderungen

- Home Assistant 2024.x oder höher
- Für Text-Modus: input_text-Entity erforderlich

## Lizenz

Siehe LICENSE Datei
