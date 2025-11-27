#!/usr/bin/env python3
"""
Complete responsive breadcrumb migration script
This replaces the entire Breadcrumb children section with the responsive version
"""

import os
import re

# Template for the responsive breadcrumb children (mobile + desktop layouts)
RESPONSIVE_BREADCRUMB_TEMPLATE = """        <>
          {isMobile ? (
            // Mobile layout - compact with dropdown menu
            <Grid
              container
              sx={{
                width: "95%",
                height: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Grid item xs={8}>
                <Typography
                  variant="body2"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    textAlign: "left",
                  }}
                >
                  {tamamlanan}/{toplam} Tamamlandı
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  aria-label="menu"
                  aria-controls={menuOpen ? 'breadcrumb-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                >
                  <IconDotsVertical />
                </IconButton>
                <Menu
                  id="breadcrumb-menu"
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  {grupluMu && (
                    <MenuItem onClick={handleOpen}>
                      Yeni Grup Ekle
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleMenuClose}>
                    Ek Belge Yükle
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { setIsClickedVarsayilanaDon(true); handleMenuClose(); }}
                    disabled={isClickedVarsayilanaDon}
                  >
                    Varsayılana Dön
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          ) : (
            // Desktop layout - original button grid
            <Grid
              container
              sx={{
                width: "95%",
                height: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
              }}
            >
              <Grid
                item
                xs={12}
                md={grupluMu ? 2.8 : 3.8}
                lg={grupluMu ? 2.8 : 3.8}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    textAlign: "center",
                  }}
                >
                  {tamamlanan}/{toplam} Tamamlandı
                </Typography>
              </Grid>
              {grupluMu && (
                <Grid
                  item
                  xs={3.8}
                  md={grupluMu ? 2.8 : 3.8}
                  lg={grupluMu ? 2.8 : 3.8}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen()}
                    sx={{ width: "100%" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                      }}
                    >
                      Yeni Grup Ekle
                    </Typography>{" "}
                  </Button>
                </Grid>
              )}
              <Grid
                item
                xs={__XS_SIZE__}
                md={grupluMu ? 2.8 : 3.8}
                lg={grupluMu ? 2.8 : 3.8}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EkBelgeYukleButton
                  formKodu={controller}
                  fullWidth={false}
                  text="Ek Belge Yükle"
                />
              </Grid>
              <Grid
                item
                xs={__XS_SIZE__}
                md={grupluMu ? 2.8 : 3.8}
                lg={grupluMu ? 2.8 : 3.8}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  disabled={isClickedVarsayilanaDon}
                  onClick={() => setIsClickedVarsayilanaDon(true)}
                  sx={{ width: "100%" }}
                >
                  <Typography
                    variant="body1"
                    sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                  >
                    Varsayılana Dön
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          )}
          {isCreatePopUpOpen && (
            <CreateGroupPopUp
              islem={islem}
              setIslem={setIslem}
              isPopUpOpen={isCreatePopUpOpen}
              setIsPopUpOpen={setIsCreatePopUpOpen}
              handleCreateGroup={handleCreateGroup}
            />
          )}
        </>"""

def replace_breadcrumb_children(file_path):
    """Replace the Breadcrumb children section with responsive version"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the Breadcrumb children section
    # Pattern: <Breadcrumb ... >\s*<>\s*<Grid container ... until just before </Breadcrumb>
    pattern = r'(<Breadcrumb[^>]*>\s*<>\s*)<Grid\s+container\s+sx={{[^}]+}}[^>]*>.*?(?=</Breadcrumb>)'
    
    # Check if already has isMobile (already converted)
    if '{isMobile ?' in content:
        return False, "Already converted"
    
    # Determine xs size (3.8 or 5.8 depending on grupluMu)
    xs_size = "5.8"  # default for grupluMu = false
    if 'grupluMu = true' in content or 'grupluMu: true' in content:
        xs_size = "3.8"
    
    responsive_content = RESPONSIVE_BREADCRUMB_TEMPLATE.replace('__XS_SIZE__', xs_size)
    
    # Replace the section
    new_content = re.sub(pattern, r'\1' + responsive_content, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, "Updated"
    else:
        return False, "No match found"

# List of all files to update
files_to_update = [
    r'src\app\(Uygulama)\PlanVeProgram\DenetimProgrami\page.tsx',
    r'src\app\(Uygulama)\PlanVeProgram\DenetimPlani\page.tsx',
    # Add more files here...
]

if __name__ == '__main__':
    base_dir = r'c:\Users\lenov\FasWebUI'
    
    print("Starting Breadcrumb children replacement...")
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for rel_path in files_to_update:
        file_path = os.path.join(base_dir, rel_path)
        if os.path.exists(file_path):
            try:
                updated, message = replace_breadcrumb_children(file_path)
                if updated:
                    print(f"✓ {rel_path}: {message}")
                    success_count += 1
                else:
                    print(f"- {rel_path}: {message}")
                    skip_count += 1
            except Exception as e:
                print(f"✗ {rel_path}: Error - {e}")
                error_count += 1
        else:
            print(f"✗ {rel_path}: File not found")
            error_count += 1
    
    print(f"\nComplete! Updated: {success_count}, Skipped: {skip_count}, Errors: {error_count}")
