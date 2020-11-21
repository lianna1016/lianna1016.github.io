
//map
agency = {
    "BIA": "USDI Bureau of Indian Affairs",
    "BLM": "Bureau of Land Management",
    "CAL": "California Department of Forestry (CAL FIRE)",
    "CCO": "Contract Counties",
    "DOD": "Department of Defense",
    "FWS": "USDI Fish and Wildlife Service",
    "LRA": "Local Response Area",
    "NOP": "No Protection",
    "NPS": "National Park Service",
    "PVT": "Private",
    "USF": "United States Forest Service",
    "OTH": "Other",
    "CDF": "California Department of Forestry (CAL FIRE)"
}

//mapping of cause number to description
causes = {
    1: 'Lightning',
    2: 'Equipment Use',
    3: 'Smoking',
    4: 'Campfire',
    5: 'Debris',
    6: 'Railroad',
    7: 'Arson',
    8: 'Playing with Fire',
    9: 'Miscellaneous',
    10: 'Vehicle',
    11: 'Power Line',
    12: 'Firefighter Training',
    13: 'Non-Firefighter Training',
    14: 'Unknown/Unidentified',
    15: 'Structure',
    16: 'Aircraft',
    17: 'Volcanic',
    18: 'Escaped Prescribed Burn',
    19: 'Illegal Alien Campfire'
}

function unitCode(a){
    switch (a) {
        case "AEU":
            a = "Amador / El Dorado Unit"
            break;
        case "BDU":
            a = "San Bernardino Unit"
            break;
        case "BEU":
            a = "San Benito / Monterey Unit"
            break;
        case "BTU":
            a = "Butte Unit"
            break;
        case "CZU":
            a = "San Mateo / Santa Cruz Unit"
            break;
        case "FKU":
            a = "Fresno / Kings Unit"
            break;
        case "HUU":
            a = "Humboldt / Del Norte Unit"
            break;
        case "LMU":
            a = "Lassen / Modoc Unit"
            break;
        case "LNU":
            a = "Sonoma / Lake / Napa Unit"
            break;
        case "MEU":
            a = "Mendocino Unit"
            break;
        case "MMU":
            a = "Madera / Mariposa / Merced Unit"
            break;
        case "MVU":
            a = "San Diego Unit"
            break;
        case "NEU":
            a = "Nevada / Yuba / Placer Unit"
            break;
        case "RRU":
            a = "Riverside Unit"
            break;
        case "SCU":
            a = "Santa Clara Unit"
            break;
        case "SHU":
            a = "Shasta / Trinity Unit"
            break;
        case "SKU":
            a = "Siskiyou Unit"
            break;
        case "SLU":
            a = "San Luis Obispo Unit"
            break;
        case "TCU":
            a = "Tuolumne / Calaveras Unit"
            break;
        case "TGU":
            a = "Tehama / Glenn Unit"
            break;
        case "TUU":
            a = "Tulare Unit"
            break;
        case "KRN":
            a = "Kern County"
            break;
        case "LAC":
            a = "Los Angeles County"
            break;
        case "MRN":
            a = "Marin County"
            break;
        case "ORC":
            a = "Orange County"
            break;
        case "SBC":
            a = "Santa Barbara County"
            break;
        case "VNC":
            a = "Ventura County"
            break;
    }
    return a;
}
