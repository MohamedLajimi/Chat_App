import React from "react";
import { useToast } from "react-native-toast-notifications";

export const showErrorToast = (message) => {
    const toast = useToast();
   
};


export const showSuccessToast = (message) => {
    const toast = useToast();
    toast.show(message, {
        type: "success", 
        duration: 3000, 
        animationType: "slide-in", 
        position: "bottom", 
        offset: 30, 
    });
};

