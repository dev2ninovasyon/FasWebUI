'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { AppState } from '@/store/store';
import { useSelector } from '@/store/hooks';
import icKontrolBelgesiData from '@/data/ic-kontrol-belgesi-data.json';
import {
  IcKontrolSorusu,
  YanıtTipi,
  IcKontrolTespitFormVeri,
} from '@/types/IcKontrolBelgesi.types';
import { createCalismaKagidiVerisi, updateCalismaKagidiVerisi } from '@/api/CalismaKagitlari/CalismaKagitlari';

interface SoruCevap {
  soruSira: number;
  secilenYanit: YanıtTipi;
}

const IsletmeyeIliskinIcKontrolTespitForm: React.FC<{
  controller?: string;
  setTamamlanan?: (deger: number) => void;
  setToplam?: (deger: number) => void;
}> = ({ controller = 'IcKontrolTespitBelgesi', setTamamlanan, setToplam }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  
  // Soruların cevapları: Map<soruSira, secilenYanit>
  const [cevaplar, setCevaplar] = useState<Map<number, YanıtTipi>>(new Map());
  
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [basariMesaji, setBasariMesaji] = useState('');
  const [hata, setHata] = useState('');

  // İlk yüklemede, default olarak tüm soruları "hayir" olarak set et
  useEffect(() => {
    const belgesi = icKontrolBelgesiData as any;
    if (belgesi.sorular) {
      const defaultCevaplar = new Map<number, YanıtTipi>();
      belgesi.sorular.forEach((soru: IcKontrolSorusu) => {
        defaultCevaplar.set(soru.sira, 'hayir'); // Default: Hayır
      });
      setCevaplar(defaultCevaplar);
      setToplam?.(belgesi.toplamSoru);
    }
  }, [setToplam]);

  // Yanıt değiştiğinde
  const handleYanitDegis = (soruSira: number, yeniYanit: YanıtTipi) => {
    const yeniCevaplar = new Map(cevaplar);
    yeniCevaplar.set(soruSira, yeniYanit);
    setCevaplar(yeniCevaplar);
  };

  // Seçilen yanıt bilgisini getir
  const getYanitBilgisi = (soru: IcKontrolSorusu, yanit: YanıtTipi) => {
    return soru.yanıtlar[yanit];
  };

  // Kaydet
  const handleKaydet = useCallback(async () => {
    if (!user.denetlenenId || !user.denetciId || !user.yil) {
      setHata('Kullanıcı bilgileri eksik');
      return;
    }

    setKaydediyor(true);
    setHata('');
    setBasariMesaji('');

    try {
      const belgesi = icKontrolBelgesiData as any;
      
      // Form verisini API formatına dönüştür
      const soruCevaplar = belgesi.sorular.map((soru: IcKontrolSorusu) => {
        const secilenYanit = cevaplar.get(soru.sira) || 'hayir';
        const yanitBilgisi = getYanitBilgisi(soru, secilenYanit);

        return {
          soruSira: soru.sira,
          soruMetni: soru.soruMetni,
          secilenYanit,
          riskSeviyesi: yanitBilgisi?.riskSeviyesi || '',
          aciklamaMetni: yanitBilgisi?.aciklamaMetni || '',
          denetimAksiyonu: yanitBilgisi?.denetimAksiyonu || '',
          ilgiliBDS: yanitBilgisi?.ilgiliBDS || '',
        };
      });

      const formVeri: IcKontrolTespitFormVeri = {
        denetlenenId: user.denetlenenId,
        denetciId: user.denetciId,
        yil: user.yil,
        soruCevaplar,
        tamamlanmaMi: true,
        olusturmaTarihi: new Date().toISOString(),
      };

      // API'ye gönder
      const result = await createCalismaKagidiVerisi(controller, formVeri);

      if (result) {
        setBasariMesaji('İç Kontrol Belgesi başarıyla kaydedildi');
        // Tamamlanan sayısını güncelle
        setTamamlanan?.(cevaplar.size);
        
        // 3 saniye sonra mesajı temizle
        setTimeout(() => setBasariMesaji(''), 3000);
      } else {
        setHata('Kaydetme sırasında bir hata oluştu');
      }
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'Bilinmeyen hata');
      console.error('Kaydetme hatası:', error);
    } finally {
      setKaydediyor(false);
    }
  }, [cevaplar, user, controller, setTamamlanan]);

  const belgesi = icKontrolBelgesiData as any;
  
  if (!belgesi.sorular || belgesi.sorular.length === 0) {
    return <Alert severity="error">İç Kontrol Belgesi verisi yüklenemedi</Alert>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Başlık */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="İŞLETMEYE İLİŞKİN İÇ KONTROL TESPİT BELGESİ"
          subheader={`Toplam Soru: ${belgesi.toplamSoru}`}
          titleTypographyProps={{ variant: 'h5' }}
        />
      </Card>

      {/* Mesajlar */}
      {basariMesaji && <Alert severity="success" sx={{ mb: 2 }}>{basariMesaji}</Alert>}
      {hata && <Alert severity="error" sx={{ mb: 2 }}>{hata}</Alert>}

      {yukleniyor ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Sorular */}
          <Grid container spacing={2}>
            {belgesi.sorular.map((soru: IcKontrolSorusu, idx: number) => {
              const secilenYanit = cevaplar.get(soru.sira) || 'hayir';
              const yanitBilgisi = soru.yanıtlar[secilenYanit];

              return (
                <Grid size={{ xs: 12 }} key={`soru-${soru.sira}`}>
                  <Card sx={{ p: 2 }}>
                    {/* Soru Başlığı */}
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Sıra {soru.sira} — {soru.bolum} — {soru.altBolum}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.5 }}>
                          {soru.soruMetni}
                        </Typography>
                      </Box>
                      <Box>
                        <RadioGroup
                          row
                          value={secilenYanit}
                          onChange={(e) =>
                            handleYanitDegis(
                              soru.sira,
                              e.target.value as YanıtTipi
                            )
                          }
                          sx={{ gap: 3 }}
                        >
                          <FormControlLabel
                            value="evet"
                            control={<Radio />}
                            label="EVET"
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                fontWeight: secilenYanit === 'evet' ? 'bold' : 'normal',
                              },
                            }}
                          />
                          <FormControlLabel
                            value="hayir"
                            control={<Radio />}
                            label="HAYIR"
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                fontWeight: secilenYanit === 'hayir' ? 'bold' : 'normal',
                              },
                            }}
                          />
                        </RadioGroup>
                      </Box>

                      {/* Seçilen Yanıta Ait Metinler */}
                      {yanitBilgisi && (
                        <Box
                          sx={{
                            p: 2,
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                            mt: 1.5,
                          }}
                        >
                          <Stack spacing={1.5} sx={{ fontSize: '0.95rem' }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                Risk Seviyesi:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    yanitBilgisi.riskSeviyesi === 'Kritik'
                                      ? '#d32f2f'
                                      : yanitBilgisi.riskSeviyesi === 'Yüksek'
                                      ? '#f57c00'
                                      : yanitBilgisi.riskSeviyesi === 'Orta'
                                      ? '#fbc02d'
                                      : '#388e3c',
                                  fontWeight: 'bold',
                                }}
                              >
                                {yanitBilgisi.riskSeviyesi}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                Açıklama:
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {yanitBilgisi.aciklamaMetni}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                Denetim Aksiyonu:
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {yanitBilgisi.denetimAksiyonu}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                İlgili BDS:
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {yanitBilgisi.ilgiliBDS}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Stack>

                    {/* Divider (son soru değilse) */}
                    {idx < belgesi.sorular.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Kaydet Butonu */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleKaydet}
              disabled={kaydediyor}
            >
              {kaydediyor ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default IsletmeyeIliskinIcKontrolTespitForm;
