from functools import lru_cache

import bharatpin


@lru_cache(maxsize=1)
def get_all_states():
    return sorted(bharatpin.get_all_states())


@lru_cache(maxsize=128)
def get_cities_for_state(state: str):
    if not state:
        return []
    districts = bharatpin.get_districts_by_state(state)
    return sorted(districts) if districts else []
