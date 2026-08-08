import re

from rules import FAILURE_RULES


def analyze_log(log):

    results = []

    for rule in FAILURE_RULES:

        matched_patterns = []
        score = 0

        for pattern in rule["patterns"]:

            match = re.search(
                pattern["regex"],
                log,
                re.IGNORECASE
            )

            if match:

                score += pattern["weight"]

                matched_patterns.append({
                    "description": pattern["description"],
                    "weight": pattern["weight"],
                    "matched_text": match.group(0)
                })

        if score > 0:

            results.append({
                "category": rule["category"],
                "score": score,
                "cause": rule["cause"],
                "fix": rule["fix"],
                "matched_patterns": matched_patterns
            })


    if not results:

        return {
            "category": "Unknown",
            "confidence": 0,
            "score": 0,
            "cause": "The analyzer could not identify this failure.",
            "fix": "Manual investigation is required.",
            "matched_patterns": []
        }


    results.sort(
        key=lambda result: result["score"],
        reverse=True
    )


    best_result = results[0]


    total_score = sum(
        result["score"]
        for result in results
    )


    confidence = (
        best_result["score"] / total_score
    ) * 100


    best_result["confidence"] = round(
        confidence,
        2
    )


    return best_result