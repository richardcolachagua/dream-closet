import React from "react";
import { Button, Stack, Typography } from "@mui/material";

const GenderSelectStep = ({
    selectedGender,
    onChangeGender,
    onBack,
    onNext,
    loading
}) => {
    const handleSelect = (value) => {
        onChangeGender && onChangeGender(value);
    };

    const canContinue = Boolean(selectedGender) && !loading;

    return (
        <>
        <Typography
        variant="h6"
        sx={{ textAlign: "center", mb: 3, fontWeight: "bold", color: "white"}}  
        >
            How do you primarily shop for clothes?
        </Typography>

        <Stack
        direction={{ xs: "column", sm: "row"}}
        spacing={2}
        sx={{justifyContent: "center", mb: 4}}
        >
            <Button
                variant={selectedGender === "female" ? "contained" : "outlined"}
                onClick={() => handleSelect("female")}
                sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: "999px",
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: "bold",
                    bgcolor: selectedGender === "female" ? "turquoise" : "transparent",
                    color: selectedGender === "female" ? "black" : "grey.100",
                    borderColor: "turquoise",
                    "&:hover": {
                        bgcolor: selectedGender === "female"
                        ? "turquoise"
                        : "rgba(64, 224, 208, 0.12)"                        
                    }
                }}
            >
                I shop mostly in women&apos;s sections
            </Button>

            <Button
            variant={selectedGender === " male" ? "contained" : "outlined"}
            onClick={() => handleSelect("male")}
            sx={{
                flex: 1,
                py: 1.5,
                borderRadius: "999px",
                textTransform: "none",
                fontSize: 16,
                fontWeight: "bold",
                bgcolor: selectedGender === "male" ? "turquoise" : "transparent",
                color: selectedGender === "male" ? "black" : "grey.100",
                borderColor: "turquoise",
                "&:hover": {
                    bgcolor: selectedGender === "male"
                    ? "turquoise"
                    : "rgba(64, 224, 208, 0.12)"
                }
            }}
            >
                I shop mostly in men&apos;s sections
            </Button>
        </Stack>

        <Typography
        variant="body1"
        sx={{
            textAlign: "center",
            mb: 4,
            color: "white"
        }}
        >
            This helps us tailor your brands, categories, and recommendations.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="space-between">
            {onBack && (
                <Button
                variant="text"
                onClick={onBack}
                sx={{
                    color: "grey.300",
                    textTransform: "none",
                }}
                >
                    Back
                </Button>
            )}

            {onNext && (
                <Button
                variant="contained"
                onClick={onNext}
                disabled={!canContinue}
                sx={{
                    ml: "auto",
                    px: 4,
                    py: 1.2,
                    borderRadius: "999px",
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: "bold",
                    bgcolor: "turquoise",
                    color: "black",
                    "&:hover": {
                        bgcolor: "#00b4aa",
                    }
                }}
                >
                    {loading ? "Saving..." : "Next: Clothing Types"}
                </Button>
            )}
        </Stack>
        </>
    )
}

export default GenderSelectStep;