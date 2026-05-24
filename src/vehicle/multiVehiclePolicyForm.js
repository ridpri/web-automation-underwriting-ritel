export function createMultiVehiclePolicyForm() {
  return {
    insuredName: "",
    customerType: "Pribadi",
    phone: "",
    email: "",
    idNumber: "",
    address: "",
    coverageStartDate: "",
    coverageEndDate: "",
    selectedCustomerCif: "",
    quoted: false,
    consentApproved: false,
    paymentMethod: "",
    paymentStatus: "",
    notice: "",
  };
}
