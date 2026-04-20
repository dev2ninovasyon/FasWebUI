import React, { createContext, useContext, useState, useCallback } from "react";

interface PageTitleContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export const PageTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const updatePageTitle = useCallback((title: string) => {
    setPageTitle(title);
  }, []);

  const updateUnreadNotifications = useCallback((count: number) => {
    setUnreadNotifications(count);
  }, []);

  return (
    <PageTitleContext.Provider
      value={{
        pageTitle,
        setPageTitle: updatePageTitle,
        unreadNotifications,
        setUnreadNotifications: updateUnreadNotifications,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitleContext = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitleContext must be used within PageTitleProvider");
  }
  return context;
};
