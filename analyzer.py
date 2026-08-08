from rules import FAILURE_RULES

# fucntion to analyze the log and return the category, cause, fix, and matched patterns & confidence score
def analyze_log(log):

    # Convert the log to lowercase for case-insensitive matching
    log = log.lower()

    # Initialize an empty list to store the results of matched rules
    results = []

    # Iterate through each rule in the FAILURE_RULES list
    for rule in FAILURE_RULES:

        # Initialize an empty list to store matched patterns for the current rule
        matched_patterns = []

        # Iterate through each pattern in the current rule's patterns
        for pattern in rule['patterns']:

            # Check if the pattern is present in the log, append it to matched_patterns if found
            if pattern.lower() in log:
                matched_patterns.append(pattern)

        # If any patterns were matched for the current rule, append the rule's details to the results list
        if matched_patterns:

            results.append({
                "category": rule['category'],
                "score": len(matched_patterns),
                "cause": rule['cause'],
                "fix": rule['fix'],
                "matched_patterns": matched_patterns
            })

    # Nothing matched, return a default response indicating that the failure could not be identified
    if not results:

        return {
            "category": "Unknown",
            "confidence": 0,
            "cause": "The analyzer could not identify this failure.",
            "fix": "Manual investigation is required.",
            "matched_pattern": []
        }

    # Highest score first
    results.sort(
        key = lambda result: result['score'],
        reverse = True
    )

    best_result = results[0]

    # simple confidence calculation
    total_matches = sum(
        result["score"] for result in results
    )

    # Calculate confidence as a percentage of the best result's score over the total matches
    confidence = (
        best_result["score"] / total_matches
    ) * 100

    best_result["confidence"] = round(confidence, 2)

    return best_result