export const findSeason = (month) => {
    if (month >= 0 && month <= 11) {
        if (month < 3) return "winter";
        else if (month >= 9) return "fall";
        else if (month >= 6) return "summer";
        else if (month >= 3) return "spring";
    } else {
        return "spring"
    }
}