import { createSlice } from "@reduxjs/toolkit";

interface StateType {
  id?: number;
  denetciId?: number;
  denetciFirmaAdi?: string;
  denetlenenId?: number;
  denetlenenFirmaAdi?: string;
  denetimTuru?: string;
  bobimi?: boolean;
  tfrsmi?: boolean;
  enflasyonmu?: boolean;
  konsolidemi?: boolean;
  bddkmi?: boolean;
  yil?: number;
  rol?: string[];
  yetki?: string;
  unvan?: string;
  kullaniciAdi?: string;
  mail?: string;
  token?: string;
}

const initialState: StateType = {
  id: 0,
  denetciId: 0,
  denetciFirmaAdi: "",
  denetlenenId: 0,
  denetlenenFirmaAdi: "",
  denetimTuru: "",
  bobimi: false,
  tfrsmi: false,
  enflasyonmu: false,
  konsolidemi: false,
  bddkmi: false,
  yil: 0,
  rol: undefined,
  yetki: undefined,
  unvan: "",
  kullaniciAdi: "",
  mail: "",
  token: "",
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setId: (state: StateType, action) => {
      state.id = action.payload;
    },
    setDenetciId: (state: StateType, action) => {
      state.denetciId = action.payload;
    },
    setDenetciFirmaAdi: (state: StateType, action) => {
      state.denetciFirmaAdi = action.payload;
    },
    setDenetlenenId: (state: StateType, action) => {
      state.denetlenenId = action.payload;
    },
    setDenetlenenFirmaAdi: (state: StateType, action) => {
      state.denetlenenFirmaAdi = action.payload;
    },
    setDenetimTuru: (state: StateType, action) => {
      state.denetimTuru = action.payload;
    },
    setBobimi: (state: StateType, action) => {
      state.bobimi = action.payload;
    },
    setTfrsmi: (state: StateType, action) => {
      state.tfrsmi = action.payload;
    },
    setEnflasyonmu: (state: StateType, action) => {
      state.enflasyonmu = action.payload;
    },
    setKonsolidemi: (state: StateType, action) => {
      state.konsolidemi = action.payload;
    },
    setBddkmi: (state: StateType, action) => {
      state.bddkmi = action.payload;
    },
    setYil: (state: StateType, action) => {
      state.yil = action.payload;
    },
    setRol: (state: StateType, action) => {
      state.rol = action.payload;
    },
    setYetki: (state: StateType, action) => {
      state.yetki = action.payload;
    },
    setUnvan: (state: StateType, action) => {
      state.unvan = action.payload;
    },
    setKullaniciAdi: (state: StateType, action) => {
      state.kullaniciAdi = action.payload;
    },
    setMail: (state: StateType, action) => {
      state.mail = action.payload;
    },
    setToken: (state: StateType, action) => {
      state.token = action.payload;
    },
    resetToNull: (state: StateType, action) => {
      if (action.payload == "") {
        state.id = undefined;
        state.denetciId = undefined;
        state.denetciFirmaAdi = undefined;
        state.denetlenenId = undefined;
        state.denetlenenFirmaAdi = undefined;
        state.denetimTuru = undefined;
        state.bobimi = undefined;
        state.tfrsmi = undefined;
        state.enflasyonmu = undefined;
        state.konsolidemi = undefined;
        state.bddkmi = undefined;
        state.yil = undefined;
        state.rol = undefined;
        state.yetki = undefined;
        state.unvan = undefined;
        state.kullaniciAdi = undefined;
        state.mail = undefined;
        state.token = undefined;
      }
    },
  },
});

export const {
  setId,
  setDenetciId,
  setDenetciFirmaAdi,
  setDenetlenenId,
  setDenetlenenFirmaAdi,
  setDenetimTuru,
  setBobimi,
  setTfrsmi,
  setEnflasyonmu,
  setKonsolidemi,
  setBddkmi,
  setYil,
  setRol,
  setYetki,
  setUnvan,
  setKullaniciAdi,
  setMail,
  setToken,
  resetToNull,
} = UserSlice.actions;

export default UserSlice.reducer;
