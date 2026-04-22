import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";
import axios from "axios";

const controller = "PlanVeProgram";

export const getDenetimPlaniOnemlilikExcelModel = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  const config = createAuthorizedAxiosConfig(
    {
      baseURL: url,
      method: "get",
      url: `/api/${controller}/OnemlilikExcelModel`,
      params: { denetciId, denetlenenId, yil },
    },
    null
  );
  const response = await axios(config);
  return response.data;
};

export const previewDenetimPlaniOnemlilikExcelModel = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  payload: any
) => {
  const config = createAuthorizedAxiosConfig(
    {
      baseURL: url,
      method: "post",
      url: `/api/${controller}/PreviewOnemlilikExcelModel`,
      params: { denetciId, denetlenenId, yil },
      data: payload,
    },
    null
  );
  const response = await axios(config);
  return response.data;
};

export const updateDenetimPlaniOnemlilikExcelModel = async (
  denetciId: number,
  denetlenenId: number,
  yil: number,
  payload: any
) => {
  const config = createAuthorizedAxiosConfig(
    {
      baseURL: url,
      method: "post",
      url: `/api/${controller}/UpdateOnemlilikExcelModel`,
      params: { denetciId, denetlenenId, yil },
      data: payload,
    },
    null
  );
  const response = await axios(config);
  return response.data;
};

export const resetDenetimPlaniOnemlilikExcelModel = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  const config = createAuthorizedAxiosConfig(
    {
      baseURL: url,
      method: "post",
      url: `/api/${controller}/ResetOnemlilikExcelModel`,
      params: { denetciId, denetlenenId, yil },
    },
    null
  );
  const response = await axios(config);
  return response.data;
};

export const restorePreviousDenetimPlaniOnemlilikExcelModel = async (
  denetciId: number,
  denetlenenId: number,
  yil: number
) => {
  const config = createAuthorizedAxiosConfig(
    {
      baseURL: url,
      method: "post",
      url: `/api/${controller}/RestorePreviousOnemlilikExcelModel`,
      params: { denetciId, denetlenenId, yil },
    },
    null
  );
  const response = await axios(config);
  return response.data;
};
