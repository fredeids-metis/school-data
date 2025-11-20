#!/bin/bash

# Migration script for curriculum restructuring
# Phase 2: Copy files to new folders

CURRICULUM_DIR="data/curriculum"
OLD_PROGRAMFAG="$CURRICULUM_DIR/programfag"
VALGFRIE="$CURRICULUM_DIR/valgfrie-programfag"
FELLESFAG="$CURRICULUM_DIR/fellesfag"

echo "🚀 Starting FASE 2: Copying files..."
echo ""

# Counter
valgfrie_count=0
fellesfag_count=0

# List of files to copy to valgfrie-programfag (all except Historie and Spansk)
valgfrie_files=(
    "Biologi_1.md"
    "Biologi_2.md"
    "Bilde.md"
    "Engelsk_1.md"
    "Engelsk_2.md"
    "Entreprenørskap_og_bedriftsutvikling_1.md"
    "Entreprenørskap_og_bedriftsutvikling_2.md"
    "Fysikk_1.md"
    "Fysikk_2.md"
    "Grafisk_design.md"
    "Historie_og_filosofi_1.md"
    "Historie_og_filosofi_2.md"
    "Informasjonsteknologi_1.md"
    "Kjemi_1.md"
    "Kjemi_2.md"
    "Markedsføring_og_ledelse_1.md"
    "Markedsføring_og_ledelse_2.md"
    "Matematikk_2P.md"
    "Matematikk_R1.md"
    "Matematikk_R2.md"
    "Musikk_fordypning_1.md"
    "Musikk_fordypning_2.md"
    "Politikk_og_menneskerettigheter.md"
    "Psykologi_1.md"
    "Psykologi_2.md"
    "Rettslære_1.md"
    "Rettslære_2.md"
    "Samfunnsøkonomi_1.md"
    "Samfunnsøkonomi_2.md"
    "Sosialkunnskap.md"
    "Sosiologi_og_sosialantropologi.md"
    "Økonomistyring.md"
    "Økonomi_og_ledelse.md"
)

# Copy valgfrie programfag
echo "📦 Copying valgfrie programfag..."
for file in "${valgfrie_files[@]}"; do
    if [ -f "$OLD_PROGRAMFAG/$file" ]; then
        cp "$OLD_PROGRAMFAG/$file" "$VALGFRIE/$file"
        valgfrie_count=$((valgfrie_count + 1))
        echo "  ✓ $file"
    else
        echo "  ⚠️  $file NOT FOUND"
    fi
done

echo ""
echo "📦 Copying fellesfag..."

# Copy fellesfag
fellesfag_files=(
    "Historie.md"
    "Spansk_I+II.md"
)

for file in "${fellesfag_files[@]}"; do
    if [ -f "$OLD_PROGRAMFAG/$file" ]; then
        cp "$OLD_PROGRAMFAG/$file" "$FELLESFAG/$file"
        fellesfag_count=$((fellesfag_count + 1))
        echo "  ✓ $file"
    else
        echo "  ⚠️  $file NOT FOUND"
    fi
done

echo ""
echo "✅ FASE 2 Complete!"
echo "  - Copied $valgfrie_count files to valgfrie-programfag/"
echo "  - Copied $fellesfag_count files to fellesfag/"
echo ""
echo "Next: Add type fields to frontmatter"
