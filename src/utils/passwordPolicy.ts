const commonWeakPasswords = [
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "qwerty",
  "qwerty123",
  "admin",
  "admin123",
  "welcome",
  "welcome1",
  "letmein",
  "abc123",
  "iloveyou",
  "000000",
  "111111",
  "fas",
];

const sequentialPatterns = [
  "0123", "1234", "2345", "3456", "4567", "5678", "6789",
  "9876", "8765", "7654", "6543", "5432", "4321", "3210",
  "abcd", "bcde", "cdef", "defg", "efgh", "fghi", "ghij",
  "hjkl", "jklm", "klmn", "lmno", "mnop", "nopq", "pqrs",
  "qrst", "rstu", "stuv", "tuvw", "uvwx", "vwxy", "wxyz",
];

export const passwordRules = [
  "10-20 karakter aralığında olmalı.",
  "En az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermeli.",
  "Boşluk içermemeli.",
  "1234, abcd, qwerty, password gibi kolay desenler içermemeli.",
  "E-posta adresinizin bir parçasını içermemeli.",
];

const hasRepeatedCharacters = (password: string) => {
  let repeatCount = 1;
  for (let index = 1; index < password.length; index += 1) {
    if (password[index] === password[index - 1]) {
      repeatCount += 1;
      if (repeatCount >= 4) {
        return true;
      }
    } else {
      repeatCount = 1;
    }
  }

  return false;
};

export const validatePassword = (password: string, email?: string) => {
  const trimmed = password.trim();

  if (trimmed.length < 10 || trimmed.length > 20) {
    return "Şifre 10 ile 20 karakter arasında olmalıdır.";
  }

  if (/\s/.test(trimmed)) {
    return "Şifre boşluk içeremez.";
  }

  if (!/[A-Z]/.test(trimmed) || !/[a-z]/.test(trimmed) || !/[0-9]/.test(trimmed) || !/[^A-Za-z0-9]/.test(trimmed)) {
    return "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.";
  }

  const lowered = trimmed.toLowerCase();
  if (commonWeakPasswords.some((weak) => lowered.includes(weak))) {
    return "Kolay tahmin edilen şifreler kullanılamaz.";
  }

  if (sequentialPatterns.some((pattern) => lowered.includes(pattern))) {
    return "Ardışık harf veya rakam dizileri kullanılamaz.";
  }

  if (hasRepeatedCharacters(lowered)) {
    return "Aynı karakteri art arda tekrar eden şifreler kullanılamaz.";
  }

  const emailLocalPart = email?.split("@")[0]?.toLowerCase();
  if (emailLocalPart && emailLocalPart.length >= 3 && lowered.includes(emailLocalPart)) {
    return "Şifre e-posta adresinizin bir parçasını içeremez.";
  }

  return "";
};
