import { createSlice } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";

interface StateType {
  id?: number;
  denetciId?: number;
  denetlenenId?: number;
  denetlenenFirmaAdi?: string;
  yil?: number;
  rol?: string[];
  yetki?: string;
  unvan?: string;
  kullaniciAdi?: string;
  mail?: string;
  token?: string;
  tfrsmi?: boolean;
  bobimi?: boolean;
}

const initialState: StateType = {
  id: 0,
  denetciId: 0,
  denetlenenId: 0,
  denetlenenFirmaAdi: "",
  yil: 0,
  rol: [],
  yetki: "",
  unvan: "",
  kullaniciAdi: "",
  mail: "",
  token: "",
  tfrsmi: false,
  bobimi: false,
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
    setDenetlenenId: (state: StateType, action) => {
      state.denetlenenId = action.payload;
    },
    setDenetlenenFirmaAdi: (state: StateType, action) => {
      state.denetlenenFirmaAdi = action.payload;
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
    setKullaniciAdi: (state: StateType, action) => {
      state.kullaniciAdi = action.payload;
    },
    setMail: (state: StateType, action) => {
      state.mail = action.payload;
    },
    setUnvan: (state: StateType, action) => {
      state.unvan = action.payload;
    },
    setToken: (state: StateType, action) => {
      state.token = action.payload;
    },
    setTfrsmi: (state: StateType, action) => {
      state.tfrsmi = action.payload;
    },
    setBobimi: (state: StateType, action) => {
      state.bobimi = action.payload;
    },

    resetToNull: (state: StateType, action) => {
      state.denetlenenFirmaAdi = action.payload;
      state.kullaniciAdi = action.payload;
      state.mail = action.payload;
      state.rol = action.payload;
      state.yetki = action.payload;
      state.unvan = action.payload;
      state.token = action.payload;
      if (action.payload == "") {
        state.id = 0;
        state.denetciId = 0;
        state.denetlenenId = 0;
        state.yil = 0;
        state.rol = [];
        state.tfrsmi = false;
        state.bobimi = false;
      }
    },
  },
});

export const {
  setId,
  setDenetciId,
  setDenetlenenId,
  setDenetlenenFirmaAdi,
  setYil,
  setRol,
  setYetki,
  setKullaniciAdi,
  setMail,
  setUnvan,
  setToken,
  setTfrsmi,
  setBobimi,
  resetToNull,
} = UserSlice.actions;

export default UserSlice.reducer;
