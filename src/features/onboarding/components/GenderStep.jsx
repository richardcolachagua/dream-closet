import { useId, useRef } from "react";
import { Box, Button, ButtonBase, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import { colors } from "../../../shared/ui/theme/designTokens";

const options = [
  { value: "female", title: "Women’s sections", description: "Styles commonly found in women’s shopping sections." },
  { value: "male", title: "Men’s sections", description: "Styles commonly found in men’s shopping sections." },
];
const actionSx = {
  minHeight: 48, px: 3, borderRadius: 12, textTransform: "none", fontWeight: 800,
  "&.Mui-disabled": { bgcolor: "#263130", color: "#bdc8c7", border: "1px solid #3b4746" },
};

export default function GenderSelectStep({
  selectedGender = "", onChangeGender, onBack, onNext, loading = false,
  title = "How do you primarily shop for clothes?",
  description = "Choose the shopping sections you usually explore.",
  nextLabel = "Continue",
}) {
  const titleId = useId();
  const descriptionId = useId();
  const buttons = useRef([]);
  const selectedIndex = options.findIndex((option) => option.value === selectedGender);

  const handleKey = (event, index) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (loading || !keys.includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % options.length;
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + options.length) % options.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    onChangeGender?.(options[next].value);
    buttons.current[next]?.focus();
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography id={titleId} component="h2" sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.6rem" }, mb: 1 }}>
          {title}
        </Typography>
        <Typography id={descriptionId} sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>{description}</Typography>
      </Box>
      <Box role="radiogroup" aria-labelledby={titleId} aria-describedby={descriptionId}
        sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 2 }}>
        {options.map((option, index) => {
          const selected = option.value === selectedGender;
          return (
            <ButtonBase key={option.value} role="radio" aria-checked={selected}
              aria-label={option.title} disabled={loading}
              tabIndex={index === (selectedIndex < 0 ? 0 : selectedIndex) ? 0 : -1}
              ref={(element) => { buttons.current[index] = element; }}
              onKeyDown={(event) => handleKey(event, index)}
              onClick={() => onChangeGender?.(option.value)}
              sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start",
                width: "100%", minWidth: 0, minHeight: 156, p: { xs: 2.25, sm: 2.5 }, gap: 1.75,
                textAlign: "left", textTransform: "none", color: "white", borderRadius: "20px",
                border: `1px solid ${selected ? colors.accentBorder : colors.border}`,
                bgcolor: selected ? colors.accentSoft : colors.surface2,
                "&:hover": { borderColor: colors.accent, bgcolor: selected ? colors.accentSoft : colors.surface3 },
                "&.Mui-focusVisible": { outline: `3px solid ${colors.accent}`, outlineOffset: 3 },
                "&.Mui-disabled": { opacity: 0.65 } }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
                <Typography component="span" sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.4 }}>{option.title}</Typography>
                {selected ? <CheckCircleRoundedIcon sx={{ color: colors.accent, flexShrink: 0 }} />
                  : <RadioButtonUncheckedRoundedIcon sx={{ color: colors.textMuted, flexShrink: 0 }} />}
              </Box>
              <Typography component="span" sx={{ color: colors.textSecondary, lineHeight: 1.65 }}>{option.description}</Typography>
              <Typography component="span" sx={{ color: selected ? colors.accent : colors.textMuted, fontWeight: 700, fontSize: "0.8rem", mt: "auto" }}>
                {selected ? "Selected" : "Choose section"}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
      <Typography variant="body2" sx={{ color: colors.textMuted }}>You can update this later in Settings.</Typography>
      <Stack direction="row" spacing={1.5} justifyContent={onBack ? "space-between" : "flex-end"} sx={{ pt: 1 }}>
        {onBack && <Button onClick={onBack} disabled={loading} startIcon={<WestRoundedIcon />}
          sx={{ ...actionSx, color: colors.textSecondary }}>Back</Button>}
        {onNext && <Button variant="contained" onClick={onNext} disabled={!selectedGender || loading}
          endIcon={<ArrowForwardRoundedIcon />} sx={{ ...actionSx, bgcolor: colors.accent, color: "#061111",
            "&:hover": { bgcolor: colors.accentHover } }}>{loading ? "Saving…" : nextLabel}</Button>}
      </Stack>
    </Stack>
  );
}
