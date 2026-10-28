"""Unit tests for seed cleaning, classification, and parsing rules."""

from decimal import Decimal
from pathlib import Path

from app.core.enums import FoodType, PlaceCategory, Season
from app.seed.classify import (
    CategoryClassifier,
    FoodClassifier,
    SeasonParser,
    budget_level_for,
    round_to_step,
)
from app.seed.cleaning import clean_text, looks_named, normalise_key, split_trailing_note, to_label
from app.seed.config import load_mapping_config


def test_clean_text() -> None:
    assert clean_text("Goa Beach [web:1][web:2];") == "Goa Beach"
    assert clean_text("  Taj   Mahal . ") == "Taj Mahal"


def test_split_trailing_note() -> None:
    name, note = split_trailing_note("Varkala Cliff (Sunset viewpoint)")
    assert name == "Varkala Cliff"
    assert note == "Sunset viewpoint"

    name_plain, note_none = split_trailing_note("Calangute Beach")
    assert name_plain == "Calangute Beach"
    assert note_none is None


def test_to_label_and_normalise_key() -> None:
    assert to_label("  Hill Station  ") == "hill_station"
    assert normalise_key("South Goa, India") == "south goa india"


def test_round_to_step() -> None:
    assert round_to_step(Decimal("148"), 50) == Decimal("150")
    assert round_to_step(Decimal("120"), 50) == Decimal("100")


def test_classifiers_with_real_mappings() -> None:
    mappings_dir = Path(__file__).resolve().parents[1] / "data" / "mappings"
    config = load_mapping_config(mappings_dir)

    cat_classifier = CategoryClassifier(config)
    category, _ = cat_classifier.classify("Famous Sun Temple", ["Heritage"])
    assert category == PlaceCategory.TEMPLE

    category_beach, _ = cat_classifier.classify("Palolem Beach", ["Beach"])
    assert category_beach == PlaceCategory.BEACH

    season_parser = SeasonParser(config.season_rules, default=Season.ALL_YEAR)
    seasons = season_parser.parse(["November to February"])
    assert Season.WINTER in seasons

    food_classifier = FoodClassifier(config.food_rules)
    assert food_classifier.is_excluded("Goan Cashew Feni") is True
    assert food_classifier.is_excluded("Butter Chicken") is False
    food_type, _ = food_classifier.classify("Butter Chicken")
    assert food_type == FoodType.NON_VEG
    food_type_veg, _ = food_classifier.classify("Masala Dosa")
    assert food_type_veg == FoodType.VEG

    assert budget_level_for(Decimal("1500"), config.thresholds) is not None
    assert looks_named("Taj Mahal", config.named_place_rules) is True
