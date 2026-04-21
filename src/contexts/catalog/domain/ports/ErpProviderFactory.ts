import { ErpSystem } from '../../domain/value-objects/ErpReference';
import { ErpProvider } from '../../domain/ports/ErpProvider';

export interface ErpProviderFactory {
  getProvider(system: ErpSystem): ErpProvider;
}
