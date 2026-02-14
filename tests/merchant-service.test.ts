import assert from "node:assert/strict";
import test from "node:test";

import {
    resolveDataViewState,
    toRestaurantCardDto,
    type MerchantCardSource,
} from "../utils/merchantData";

const sampleMerchant: MerchantCardSource = {
    id: "m1",
    name: "City Kitchen",
    logo_url: null,
    cover_image_url: null,
    is_featured: true,
    city: "HCM",
    delivery_fee: 2.5,
    estimated_prep_time: 30,
    average_rating: 4.6,
};

test("merchant view-state helper resolves loading/error/empty/ready", () => {
    assert.equal(
        resolveDataViewState({ isLoading: true, errorMessage: "", hasData: false }),
        "loading",
    );
    assert.equal(
        resolveDataViewState({ isLoading: false, errorMessage: "boom", hasData: false }),
        "error",
    );
    assert.equal(
        resolveDataViewState({ isLoading: false, errorMessage: "", hasData: false }),
        "empty",
    );
    assert.equal(
        resolveDataViewState({ isLoading: false, errorMessage: "", hasData: true }),
        "ready",
    );
});

test("merchant adapter maps backend DTO to restaurant card DTO", () => {
    const result = toRestaurantCardDto(sampleMerchant);
    assert.equal(result.id, sampleMerchant.id);
    assert.equal(result.name, sampleMerchant.name);
    assert.equal(result.deliveryTime, "30 min");
    assert.equal(result.deliveryFee, "$2.50");
    assert.equal(result.promoText, "Featured");
    assert.deepEqual(result.cuisine, ["HCM"]);
});
