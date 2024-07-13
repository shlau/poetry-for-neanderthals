package util

import "testing"

func AssertStatus(t testing.TB, got int, want int) {
	if got != want {
		t.Errorf("got code %d, want code %d", got, want)
	}
}
