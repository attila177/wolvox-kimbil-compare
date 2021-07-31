# Wolvox Kimbil Compare
This webapp allows comparing csv exports of the Akinsoft "Wolvox" ERP system for hotels and the "Kimbil" system for registering hotel guests at the Turkish Ministry of the Interior.

# Detected Errors
* Entry cannot be found in second list -> red
* Entry with similar name found (maximum of 2 letters differing) -> yellow
* Entry with same room number and first name found (but differing last name) -> fuchsia
* Entry with same name, but different room number found -> light blue

# Features
* Automatic detection of CSV cell separator character (v1.4.0)
* Interface in turkish (v1.5.0)
