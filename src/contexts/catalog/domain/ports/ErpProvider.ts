export interface ErpProjectData {
  externalId: string;
  name: string;
  towers: Array<{
    externalId: string;
    name: string;
    plannedDeliveryDate: Date;
  }>;
}

export interface ErpProvider {
  getProjectInfo(erpId: string): Promise<ErpProjectData>;
}
