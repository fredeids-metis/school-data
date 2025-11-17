#!/bin/bash

# UDIR Læreplan-henter - MULTI-FAG med frontmatter
# Henter læreplandata for alle fag i programfag_lk20.txt

INPUT_FILE="programfag_lk20.txt"
OUTPUT_DIR="programfag"
API_BASE="https://data.udir.no/kl06/v201906"

echo "===================================="
echo "UDIR Læreplan-henter (Multi-fag)"
echo "===================================="
echo ""

# Sjekk om jq er installert
if ! command -v jq &> /dev/null; then
    echo "❌ Feil: jq er ikke installert"
    echo "Installer med: brew install jq"
    exit 1
fi

# Sjekk om input-filen finnes
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Feil: Finner ikke $INPUT_FILE"
    exit 1
fi

# Lag output-mappe
mkdir -p "$OUTPUT_DIR"

# Funksjon for å hente JSON
fetch_json() {
    curl -s -H "Accept: application/json" "$1"
}

# Tell antall fag
TOTAL_FAGS=$(grep -v "^#" "$INPUT_FILE" | grep -v "^$" | wc -l | tr -d ' ')
echo "📚 Fant $TOTAL_FAGS fag å hente"
echo ""

CURRENT=0
SUCCESSFUL=0
FAILED=0

# Les filen linje for linje
while IFS=';' read -r FAGNAVN FAGKODE LAEREPLAN_KODE; do
    # Hopp over kommentarer og tomme linjer
    [[ "$FAGNAVN" =~ ^#.*$ ]] && continue
    [[ -z "$FAGNAVN" ]] && continue
    
    # Trim whitespace
    FAGNAVN=$(echo "$FAGNAVN" | xargs)
    FAGKODE=$(echo "$FAGKODE" | xargs)
    LAEREPLAN_KODE=$(echo "$LAEREPLAN_KODE" | xargs)
    
    [[ -z "$FAGKODE" ]] && continue
    
    CURRENT=$((CURRENT + 1))
    
    # Lag filnavn og ID
    FILENAME="${FAGNAVN// /_}.md"
    FILE_ID=$(echo "$FAGNAVN" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/æ/ae/g' | sed 's/ø/o/g' | sed 's/å/a/g')
    OUTPUT_FILE="${OUTPUT_DIR}/${FILENAME}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[$CURRENT/$TOTAL_FAGS] $FAGNAVN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Hent fagkode
    echo "  📥 Henter fagkode..."
    FAGKODE_DATA=$(fetch_json "${API_BASE}/fagkoder/${FAGKODE}")
    
    if [ -z "$FAGKODE_DATA" ] || [ "$FAGKODE_DATA" = "null" ]; then
        echo "  ❌ Feil: Kunne ikke hente fagkode"
        FAILED=$((FAILED + 1))
        echo ""
        continue
    fi
    
    TITLE=$(echo "$FAGKODE_DATA" | jq -r '.tittel[] | select(.spraak == "nob") | .verdi' 2>/dev/null)
    
    # Hent opplæringsfag
    echo "  📥 Henter opplæringsfag..."
    OPPLAERINGSFAG_URL=$(echo "$FAGKODE_DATA" | jq -r '.opplaeringsfag[0]."url-data"' 2>/dev/null)
    
    if [ -z "$OPPLAERINGSFAG_URL" ] || [ "$OPPLAERINGSFAG_URL" = "null" ]; then
        echo "  ❌ Feil: Ingen opplæringsfag funnet"
        FAILED=$((FAILED + 1))
        echo ""
        continue
    fi
    
    OPPLAERINGSFAG=$(fetch_json "$OPPLAERINGSFAG_URL")
    
    # Hent læreplan
    echo "  📥 Henter læreplan..."
    LAEREPLAN_URL=$(echo "$OPPLAERINGSFAG" | jq -r '.["laereplan-referanse"][0]."url-data"' 2>/dev/null)
    LAEREPLAN=$(fetch_json "$LAEREPLAN_URL")
    LAEREPLAN_TITLE=$(echo "$LAEREPLAN" | jq -r '.tittel.tekst[] | select(.spraak == "nob") | .verdi' 2>/dev/null)
    
    # Hent kompetansemålsett
    echo "  📥 Henter kompetansemålsett..."
    KOMPMAAL_SETT_URL=$(echo "$OPPLAERINGSFAG" | jq -r '.["laereplan-referanse"][0]."tilhoerende-kompetansemaalsett"[0]."url-data"' 2>/dev/null)
    KOMPMAAL_SETT=$(fetch_json "$KOMPMAAL_SETT_URL")
    
    # Behandle innhold
    echo "  📄 Behandler innhold..."
    
    # Om faget
    OM_FAGET=$(echo "$LAEREPLAN" | jq -r '
      .["om-faget-kapittel"]["fagets-relevans-og-verdier"]["fagets-relevans"].beskrivelse.tekst[] 
      | select(.spraak == "nob") 
      | .verdi
    ' 2>/dev/null | sed 's/<[^>]*>//g')
    
    if [ -z "$OM_FAGET" ]; then
        OM_FAGET="_(Ikke tilgjengelig)_"
    fi
    
    # Kompetansemål
    MAAL_REFS=$(echo "$KOMPMAAL_SETT" | jq -r '.kompetansemaal[]."url-data"' 2>/dev/null)
    
    KOMPETANSEMAAL=""
    MAAL_COUNT=0
    KJERNE_URLS_FILE=$(mktemp)
    
    while IFS= read -r maal_url; do
        if [ ! -z "$maal_url" ] && [ "$maal_url" != "null" ]; then
            MAAL=$(fetch_json "$maal_url")
            
            MAAL_TEKST=$(echo "$MAAL" | jq -r '.tittel.tekst[] | select(.spraak == "nob") | .verdi' 2>/dev/null)
            
            if [ ! -z "$MAAL_TEKST" ] && [ "$MAAL_TEKST" != "null" ]; then
                KOMPETANSEMAAL="${KOMPETANSEMAAL}- ${MAAL_TEKST}"$'\n'
                MAAL_COUNT=$((MAAL_COUNT + 1))
            fi
            
            echo "$MAAL" | jq -r '.["tilknyttede-kjerneelementer"][]?.referanse."url-data" // empty' 2>/dev/null >> "$KJERNE_URLS_FILE"
        fi
    done <<< "$MAAL_REFS"
    
    # Kjerneelementer
    KJERNEELEMENTER=""
    KJERNE_COUNT=0
    UNIQUE_KJERNE_URLS=$(sort -u "$KJERNE_URLS_FILE")
    
    while IFS= read -r kjerne_url; do
        if [ ! -z "$kjerne_url" ] && [ "$kjerne_url" != "null" ]; then
            ELEMENT=$(fetch_json "$kjerne_url")
            
            TITTEL=$(echo "$ELEMENT" | jq -r '.tittel.tekst[]? | select(.spraak == "nob") | .verdi // empty' 2>/dev/null | head -1)
            BESKRIVELSE=$(echo "$ELEMENT" | jq -r '.beskrivelse.tekst[]? | select(.spraak == "nob") | .verdi // empty' 2>/dev/null | head -1 | sed 's/<[^>]*>//g')
            
            if [ ! -z "$TITTEL" ] && [ "$TITTEL" != "null" ]; then
                KJERNEELEMENTER="${KJERNEELEMENTER}### ${TITTEL}"$'\n\n'
                
                if [ ! -z "$BESKRIVELSE" ] && [ "$BESKRIVELSE" != "null" ]; then
                    KJERNEELEMENTER="${KJERNEELEMENTER}${BESKRIVELSE}"$'\n\n'
                fi
                
                KJERNE_COUNT=$((KJERNE_COUNT + 1))
            fi
        fi
    done <<< "$UNIQUE_KJERNE_URLS"
    
    rm -f "$KJERNE_URLS_FILE"
    
    if [ $KJERNE_COUNT -eq 0 ]; then
        KJERNEELEMENTER="_(Ingen kjerneelementer funnet)_"
    fi
    
    # Lag markdown-fil MED FRONTMATTER
    cat > "$OUTPUT_FILE" << EOF
---
id: ${FILE_ID}
title: ${TITLE}
fagkode: ${FAGKODE}
lareplan: ${LAEREPLAN_KODE}
vimeo: ""
generert: $(date '+%Y-%m-%d')
---

# ${TITLE}

**Læreplan:** ${LAEREPLAN_TITLE}

## Om faget

${OM_FAGET}

## Kompetansemål

${KOMPETANSEMAAL}

## Kjerneelementer

${KJERNEELEMENTER}

## Ressurser

<!-- Legg til Vimeo-lenke her når den er klar -->

---
*Hentet fra UDIR Grep API*  
*Fagkode: ${FAGKODE}*  
*Generert: $(date '+%Y-%m-%d %H:%M:%S')*
EOF
    
    echo "  ✅ $MAAL_COUNT mål, $KJERNE_COUNT kjerneelementer"
    SUCCESSFUL=$((SUCCESSFUL + 1))
    echo ""
    
done < "$INPUT_FILE"

# Oppsummering
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FERDIG!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Vellykkede: $SUCCESSFUL"
echo "❌ Feilet: $FAILED"
echo ""
echo "📁 Filer lagret i: $OUTPUT_DIR/"
