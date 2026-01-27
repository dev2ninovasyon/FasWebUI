// BelgeKontrolCardTopluOnay.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import PersonelBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import {
  getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { setFormHazirlayanOnaylayan } from "@/store/user/UserSlice";

interface CardProps {
  fetch?: () => void;
  hazirlayan?: string;
  onaylayan?: string;
  kaliteKontrol?: string;
  controller: string;
  onChangeSelectedId?: (role: "hazirlayan" | "onaylayan" | "kaliteKontrol", id?: number) => void;
}

type Veri = {
  id?: number;
  hazirlayanId?: number;
  onaylayanId?: number;
  kontrolEdenId?: number;
};

const BelgeKontrolCardTopluOnay: React.FC<CardProps> = ({
  fetch,
  hazirlayan,
  onaylayan,
  kaliteKontrol,
  controller,
  onChangeSelectedId,
}) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const dispatch = useDispatch();

  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [current, setCurrent] = useState<Veri>({});

  const roleKey = useMemo<"hazirlayan" | "onaylayan" | "kaliteKontrol">(
    () => (hazirlayan ? "hazirlayan" : onaylayan ? "onaylayan" : "kaliteKontrol"),
    [hazirlayan, onaylayan, kaliteKontrol]
  );

  const title = hazirlayan ? "Hazırlayan" : onaylayan ? "Onaylayan" : "Kalite Kontrol";

  const fetchData = async () => {
    const data = await getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(
      user.token || "",
      user.denetciId || 0,
      user.denetlenenId || 0,
      user.yil || 0,
      controller
    );
    setCurrent(data);

    const initial =
      roleKey === "hazirlayan"
        ? data.hazirlayanId
        : roleKey === "onaylayan"
        ? data.onaylayanId
        : data.kontrolEdenId;

    setSelectedId(initial);
    onChangeSelectedId?.(roleKey, initial);

    // DEBUG
    console.log(`[CARD] ${title} initial ->`, initial);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user.formHazirlayanOnaylayan) {
      fetchData();
      dispatch(setFormHazirlayanOnaylayan(false));
    }
  }, [user.formHazirlayanOnaylayan]);

  // initialValue bazı bileşenlerde sadece mount'ta okunuyor olabilir.
  // Bu yüzden kontrollü 'value' da veriyoruz. PersonelBoxAutocomplete "value" prop'unu desteklemiyorsa,
  // aşağıdaki 'key' hilesi ile re-mount ettiriyoruz.
  const autoKey = `${title}-${selectedId ?? "none"}`;

  return (
    <Grid container>
      <Grid size={12}>
        <Card sx={{ width: "100%", bgcolor: "primary.light" }}>
          <CardHeader title={<Typography variant="h6">{title}</Typography>} />
          <CardContent>
            <PersonelBoxAutocomplete
              key={autoKey}
              initialValue={selectedId}     // mount'ta okur
              tip={title}
              disabled={false}
              onSelectId={(val) => {
                const v = typeof val === "string" ? Number(val) : val; // tip normalizasyonu
                setSelectedId(v);
                onChangeSelectedId?.(roleKey, v);
                console.log(`[CARD] ${title} changed ->`, v); // DEBUG
              }}
              onSelectAdi={() => {}}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BelgeKontrolCardTopluOnay;
