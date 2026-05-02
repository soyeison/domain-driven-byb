import { describe, it } from 'node:test';
import { Project, ProjectStatus } from './Project';
import assert from 'node:assert';
import { CmsAsset } from '../value-objects/CmsAsset';
import { ErpReference } from '../value-objects/ErpReference';
import { Tower } from '../entities/Tower';
import { Typology } from '../entities/Typology';
import { Apartment } from '../entities/Apartment';

describe('Project Aggregate - Domain Logic', () => {
  describe('ERP Linking Rules', () => {
    it('Should successfully link to an ERP if not prevously linked to that', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');

      // Act
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);

      // Assert
      assert.strictEqual(project['status'], ProjectStatus.PENDING_CMS_CONTENT);
    });

    it('Should throw an error if trying to link to the same ERP system twice', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');

      // Act
      const erpReference1 = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      const erpReference2 = new ErpReference(
        'SINCO',
        'S-67890',
        'Proyecto Alpha Copia',
      );
      project.linkToErp(erpReference1);

      // Assert
      assert.throws(() => project.linkToErp(erpReference2), {
        message: 'Project is already linked to an ERP system of type SINCO.',
      });
    });

    it('Should allow linking to multiple different ERP systems', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');

      // Act
      const erpReference1 = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      const erpReference2 = new ErpReference(
        'NOVA',
        'N-54321',
        'Proyecto Alpha Copia',
      );
      project.linkToErp(erpReference1);
      project.linkToErp(erpReference2);

      // Assert
      assert.strictEqual(project['erpReferences'].length, 2);
    });
  });

  describe('Project Activation Rules', () => {
    it('Should start with LAUNCH status', () => {
      // Arrange & Act
      const project = new Project('p-1', 'Proyecto Alpha');

      // Assert
      assert.strictEqual(project['status'], ProjectStatus.LAUNCH);
    });

    it('Should throw an error if trying to activate without CMS content', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');

      // Act
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);

      // Assert
      assert.throws(() => project.activate(), {
        message: 'Cannot activate project: A MAIN_IMAGE is strictly required.',
      });
    });

    it('Should throw and error if trying to activate without linking to an ERP system', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');

      // Act
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );

      // Assert
      assert.throws(() => project.activate(), {
        message: 'Cannot activate project without linking to ERP system.',
      });
    });

    it('Should activate successfully when all conditions are met', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );

      // Act
      project.activate();

      // Assert
      assert.strictEqual(project['status'], ProjectStatus.ACTIVE);
    });

    it('Should deactivate a project successfully', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();

      // Act
      project.deactivate();

      // Assert
      assert.strictEqual(project.isActive(), false);
    });

    it('Should deactivate an already inactive project (idempotency)', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      project.deactivate();

      // Act
      project.deactivate();

      // Assert
      assert.strictEqual(project.isActive(), false);
    });

    it('Should activate an already active project', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();

      // Act
      project.activate();

      // Assert
      assert.strictEqual(project.isActive(), true);
    });
  });

  describe('Tower Activation Rules', () => {
    it('Should add a tower if the project is linked to the tower ERP system', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');

      // Act
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const validTower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(validTower);

      // Assert
      assert.strictEqual(project['towers'].length, 1);
    });

    it('Should reject a tower if the project is not linked to that towers ERP system', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);

      // Act
      const novaReference = new ErpReference('NOVA', 'N-54321', 'Torre Nova');
      const invalidTower = new Tower('t-1', novaReference, 'Torre Nova');

      // Assert
      assert.throws(() => project.addTower(invalidTower), {
        message:
          'Cannot add tower from NOVA. Link the project to this ERP first.',
      });
    });

    it('Should activate a tower if the project is activated', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();

      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const validTower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(validTower);
    });

    it('Should activate a tower in an inactive project', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const validTower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(validTower);

      // Act & Assert
      project.activateTower('t-1');
      assert.strictEqual(validTower.isActive(), true);
    });

    it('Should throw an error if trying to activate a non-existent tower', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();

      // Act
      assert.throws(() => project.activateTower('non-existent-tower'), {
        message: 'Tower not found in project.',
      });
    });

    it('Should activate a tower successfully when all conditions are met', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const validTower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(validTower);

      // Act
      project.activateTower('t-1');

      // Assert
      assert.strictEqual(validTower.isActive(), true);
    });

    it('Should activate an already active tower', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const validTower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(validTower);
      project.activateTower('t-1');

      // Act
      project.activateTower('t-1');

      // Assert
      assert.strictEqual(validTower.isActive(), true);
    });

    it('Should deactivate an active tower', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const validTower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(validTower);
      project.activateTower('t-1');

      // Act
      project.deactivateTower('t-1');

      // Assert
      assert.strictEqual(validTower.isActive(), false);
    });

    it('Should deactivate an already inactive tower', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const erpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(erpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const validTower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(validTower);
      project.activateTower('t-1');
      project.deactivateTower('t-1');

      // Act
      project.deactivateTower('t-1');

      // Assert
      assert.strictEqual(validTower.isActive(), false);
    });
  });

  describe('Apartment Activation Rules', () => {
    it('Should activate an apartment in an inactive project', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const projectErpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(projectErpReference);

      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const tower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(tower);

      const apartment = new Apartment(
        'a-1',
        'EXT-101',
        'Apartamento 101',
        'ty-1',
      );
      tower.addApartment(apartment);

      // Act
      project.activeApartment('t-1', 'a-1');

      // Assert
      assert.strictEqual(apartment.isActive(), true);
    });

    it('Should throw an error if trying to activate an apartment in a non-existent tower', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const projectErpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(projectErpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();

      // Act
      assert.throws(
        () => project.activeApartment('non-existent-tower', 'a-1'),
        {
          message: 'Tower not found in project.',
        },
      );
    });

    it('Should throw an error if trying to activate a non-existent apartment', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const projectErpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(projectErpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();

      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const tower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(tower);
      project.activateTower('t-1');

      // Act
      assert.throws(
        () => project.activeApartment('t-1', 'non-existent-apartment'),
        {
          message: 'Apartment not found in tower.',
        },
      );
    });

    it('Should activate an apartment successfully when all conditions are met', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const projectErpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(projectErpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const tower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(tower);
      project.activateTower('t-1');
      const apartment = new Apartment(
        'a-1',
        'EXT-101',
        'Apartamento 101',
        'ty-1',
      );
      tower.addApartment(apartment);
    });

    it('Should deactivate an active apartment', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const projectErpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(projectErpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const tower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(tower);
      project.activateTower('t-1');
      const apartment = new Apartment(
        'a-1',
        'EXT-101',
        'Apartamento 101',
        'ty-1',
      );
      tower.addApartment(apartment);
      project.activeApartment('t-1', 'a-1');

      // Act
      project.deactivateApartment('t-1', 'a-1');

      // Assert
      assert.strictEqual(apartment.isActive(), false);
    });

    it('Should deactivate an already inactive apartment', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const projectErpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(projectErpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const tower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(tower);
      project.activateTower('t-1');
      const apartment = new Apartment(
        'a-1',
        'EXT-101',
        'Apartamento 101',
        'ty-1',
      );
      tower.addApartment(apartment);
      project.activeApartment('t-1', 'a-1');
      project.deactivateApartment('t-1', 'a-1');

      // Act
      project.deactivateApartment('t-1', 'a-1');

      // Assert
      assert.strictEqual(apartment.isActive(), false);
    });

    it('Should activate an already active apartment', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const projectErpReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Proyecto Alpha Original',
      );
      project.linkToErp(projectErpReference);
      project.addCmsContent(
        new CmsAsset(
          'MAIN_IMAGE',
          'http://example.com/image.jpg',
          'Main project image',
        ),
      );
      project.activate();
      const towerReference = new ErpReference(
        'SINCO',
        'S-12345',
        'Torre Central',
      );
      const tower = new Tower('t-1', towerReference, 'Torre Central');
      project.addTower(tower);
      project.activateTower('t-1');
      const apartment = new Apartment(
        'a-1',
        'EXT-101',
        'Apartamento 101',
        'ty-1',
      );
      tower.addApartment(apartment);
      project.activeApartment('t-1', 'a-1');

      // Act
      project.activeApartment('t-1', 'a-1');

      // Assert
      assert.strictEqual(apartment.isActive(), true);
    });
  });

  describe('Typology Management Rules', () => {
    it('Should add a typology successfully', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');

      // Act
      const typology = new Typology('ty-1', 'Typology A', 100);
      project.addTypology(typology);

      // Assert
      assert.strictEqual(project['typologies'].length, 1);
    });

    it('Should prevent adding a duplicate typology name', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const typology1 = new Typology('ty-1', 'Typology A', 100);
      const typology2 = new Typology('ty-1', 'Typology A', 100);

      // Act
      project.addTypology(typology1);

      // Assert
      assert.throws(() => project.addTypology(typology2), {
        message:
          'Typology with id ty-1 or name Typology A already exists in the project.',
      });
    });

    it('Should prevent adding a duplicate typology id', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const typology1 = new Typology('ty-1', 'Typology A', 100);
      const typology2 = new Typology('ty-1', 'Typology B', 150);

      // Act
      project.addTypology(typology1);

      // Assert
      assert.throws(() => project.addTypology(typology2), {
        message:
          'Typology with id ty-1 or name Typology B already exists in the project.',
      });
    });

    it('Should verify typology existence correctly', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      const typology = new Typology('ty-1', 'Typology A', 100);
      project.addTypology(typology);

      // Act & Assert
      assert.doesNotThrow(() => project.verifyTypologyExists('ty-1'));
    });

    it('Should throw an error when verifying non-existent typology', () => {
      // Arrange
      const project = new Project('p-1', 'Proyecto Alpha');
      // Act & Assert
      assert.throws(() => project.verifyTypologyExists('non-existent-ty'), {
        message:
          'Typology with id non-existent-ty does not exist in the project.',
      });
    });
  });
});
