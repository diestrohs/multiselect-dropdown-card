# Changelog


## [0.0.4] - 2026-02-08

### Added
- Unterstützung für text.*-Entities (TextEntity) im Text-Modus
- Werte werden immer als kommaseparierter String gelesen und geschrieben (z. B. "1,2,3")
- Automatische Service-Erkennung: input_text.set_value oder text.set_value je nach Entity
- Visual Editor: Modus-Auswahl, value-Feld pro Item, text_entity-Feld

### Fixed
- Bugfix: Keine JSON-Arrays mehr, nur String-Parsing
- Bugfix: Mapping und Schreiben für EVCC-Integration

### Hinweise
- Kompatibel mit EVCC Scheduler und Home Assistant TextEntity
- Breaking Change: JSON-Array-Handling entfernt, nur String

## [0.0.3] - 2026-02-08

### Änderungen
- Optimierung: Dropdown-Richtungsberechnung erfolgt nur noch beim Öffnen (Performance, keine Funktionsänderung)
- Code- und Datenkonsistenz geprüft und bestätigt
- Dokumentation und README auf aktuellen Stand gebracht

### Hinweise
- Keine Breaking Changes
- Funktion und Verhalten bleiben wie in 0.0.2, aber mit besserer Performance und Wartbarkeit

## [0.0.2] - 2025-02-07

### Added
- Visual editor for card configuration via UI
- Dialog-based item management (create, edit, delete)
- Edit dialog positioned directly below edited item
- Pencil icon for editing existing items
- Plus icon on add button
- Comprehensive README with usage examples
- HACS support

### Changed
- Improved item display with 40px height matching button height
- Item entry replaced by edit dialog while editing (not appended)
- Button hover effect with semi-transparent white background

### Fixed
- Dialog state management for new vs existing items

## [0.0.1] - 2025-02-06

### Added
- Initial release
- Custom card with dropdown menu for multiple entity selection
- Support for input_boolean entities
- Icon toggle (menu-down/menu-up)
- Icon color customization
- Optional summary mode for selected items
- Responsive design with automatic dropdown positioning
- Checkbox selection in dropdown
