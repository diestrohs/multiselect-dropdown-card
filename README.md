# Multiselect Dropdown Card

Eine Home Assistant Custom Card für Mehrfachauswahl mit Dropdown-Funktionalität.

## Features

- Dropdown-Menü mit Mehrfachauswahl
- Unterstützung für Input Boolean Entities
- Responsive Design
- Automatische Positionierung (oben/unten)
- Zusammenfassung von Selections

## Installation

Datei `multiselect-dropdown-card.js` zu Ihrer Home Assistant `www` Ordner hinzufügen.

## Nutzung

```yaml
type: custom:multiselect-dropdown
name: Auswahl
icon: mdi:calendar
icon_color: var(--primary-color)
item_summarize: false
items:
  - name: Option 1
    short: Opt1
    entity: input_boolean.option_1
  - name: Option 2
    short: Opt2
    entity: input_boolean.option_2
```
