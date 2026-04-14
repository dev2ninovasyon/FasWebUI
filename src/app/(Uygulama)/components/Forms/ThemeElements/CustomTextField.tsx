import React, { useRef } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { TextField, TextFieldProps, Box } from "@mui/material";
import SpeechToTextAdornment from "./SpeechToTextAdornment";
import { motion, AnimatePresence } from "framer-motion";

const StyledTextField = styled((props: any) => {
  const { isListening, ...other } = props;
  return <TextField {...other} />;
})(({ theme, isListening }: any) => ({
  "& .MuiOutlinedInput-root": {
    transition: "background-color 0.3s ease",
    backgroundColor: isListening ? `${theme.palette.primary.main}08` : "inherit",
  },
  "& .MuiOutlinedInput-input": {
    lineHeight: "1.6",
  },
  "& .MuiOutlinedInput-input::-webkit-input-placeholder": {
    color: theme.palette.text.secondary,
    opacity: "0.8",
  },
  "&.Mui-error .MuiOutlinedInput-input::-webkit-input-placeholder": {
    color: theme.palette.error.main,
    opacity: "1",
  },
  "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[200],
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
    WebkitTextFillColor: `${theme.palette.text.primary} !important`,
    transition: "background-color 5000s ease-in-out 0s",
  },
  "& input:-webkit-autofill:hover": {
    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
  },
  "& input:-webkit-autofill:focus": {
    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
  },
  "& input:-webkit-autofill:active": {
    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
  },
}));

type CustomTextFieldProps = TextFieldProps & { disableVoice?: boolean };

const CustomTextField = ({ disableVoice, ...props }: CustomTextFieldProps) => {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = React.useState(false);
  const [interim, setInterim] = React.useState("");
  const hasExternalValue = props.value !== undefined && props.value !== null;

  const handleFinalTranscript = (transcript: string) => {
    const input = inputRef.current;
    if (!input) return;

    const currentValue = props.value as string || "";
    const suffix = currentValue.length > 0 && !currentValue.endsWith(" ") ? " " : "";
    const newValue = currentValue + suffix + transcript;

    if (props.onChange) {
      const event = {
        target: {
          value: newValue,
          name: props.name,
          id: props.id
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      props.onChange(event);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollTop = inputRef.current.scrollHeight;
          inputRef.current.setSelectionRange(newValue.length, newValue.length);
        }
      }, 10);
    }
  };

  const { InputProps, multiline, ...otherProps } = props;
  const showVoiceAdornment = multiline && !props.disabled && !disableVoice;
  const resolvedValue = hasExternalValue
    ? `${props.value ?? ""}${interim ? `${props.value ? " " : ""}${interim}` : ""}`
    : undefined;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <StyledTextField
        {...otherProps}
        multiline={multiline}
        fullWidth
        isListening={isListening}
        inputRef={(ref: any) => {
          (inputRef as any).current = ref;
          if (typeof props.inputRef === 'function') {
            props.inputRef(ref);
          } else if (props.inputRef) {
            (props.inputRef as any).current = ref;
          }
        }}
        value={resolvedValue}
        InputProps={{
          ...InputProps,
          endAdornment: (
            <>
              {showVoiceAdornment ? null : (InputProps?.endAdornment)}
            </>
          ),
          sx: {
            ...InputProps?.sx,
            position: 'relative'
          }
        }}
      />
      
      <AnimatePresence>
        {isListening && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              right: 60,
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 2 }}
            />
          </Box>
        )}
      </AnimatePresence>

      {showVoiceAdornment && (
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            right: 12,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
          }}
        >
          <SpeechToTextAdornment 
            onTranscript={handleFinalTranscript} 
            onInterimTranscript={setInterim}
            onListeningChange={setIsListening}
            standalone 
          />
          {InputProps?.endAdornment}
        </Box>
      )}
    </Box>
  );
};

export default CustomTextField;
