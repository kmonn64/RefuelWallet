contract;

use std::constants::ZERO_B256;

storage {
    counter: u64 = 0,
}

abi VerifyState {
    #[storage(read, write)]
    fn incriment_counter();
    #[storage(read)]
    fn get_test_counter() -> u64;
}

// Implement simple getters for testing purposes
impl VerifyState for Contract {
    #[storage(read, write)]
    fn incriment_counter() {
        storage.counter = storage.counter + 1;
    }
    #[storage(read)]
    fn get_test_counter() -> u64 {
        storage.counter
    }
}
