// src/utils/schemaAnalyzer.js

// Find all changes between old and new schemas
export function findSchemaChanges(oldSchemas, newSchemas) {
  const changes = [];
  
  // Check each schema
  Object.keys(oldSchemas).forEach(schemaName => {
    const oldSchema = oldSchemas[schemaName];
    const newSchema = newSchemas[schemaName];
    
    if (!newSchema) {
      changes.push({
        type: 'SCHEMA_REMOVED',
        schema: schemaName,
        severity: 'BREAKING'
      });
      return;
    }
    
    // Get properties from JSON Schema format
    const oldProperties = oldSchema.properties || {};
    const newProperties = newSchema.properties || {};
    const oldRequired = oldSchema.required || [];
    const newRequired = newSchema.required || [];
    
    // Check each field in old schema
    Object.keys(oldProperties).forEach(fieldName => {
      const oldField = oldProperties[fieldName];
      const newField = newProperties[fieldName];
      
      if (!newField) {
        changes.push({
          type: 'FIELD_REMOVED',
          schema: schemaName,
          field: fieldName,
          severity: 'BREAKING',
          description: `Removed field: ${fieldName}`,
          path: `${schemaName}.${fieldName}`
        });
      } else {
        // Check type changes
        if (oldField.type !== newField.type) {
          changes.push({
            type: 'FIELD_TYPE_CHANGED',
            schema: schemaName,
            field: fieldName,
            oldType: oldField.type,
            newType: newField.type,
            severity: 'BREAKING',
            description: `Field type changed: ${oldField.type} → ${newField.type}`,
            path: `${schemaName}.${fieldName}`
          });
        }
        
        // Check enum changes
        if (oldField.enum && newField.enum) {
          const oldEnums = new Set(oldField.enum);
          const newEnums = new Set(newField.enum);
          
          // Check for removed enum values
          oldField.enum.forEach(value => {
            if (!newEnums.has(value)) {
              changes.push({
                type: 'ENUM_VALUE_REMOVED',
                schema: schemaName,
                field: fieldName,
                value: value,
                severity: 'BREAKING',
                description: `Enum value removed: ${value}`,
                path: `${schemaName}.${fieldName}`
              });
            }
          });
          
          // Check for added enum values
          newField.enum.forEach(value => {
            if (!oldEnums.has(value)) {
              changes.push({
                type: 'ENUM_VALUE_ADDED',
                schema: schemaName,
                field: fieldName,
                value: value,
                severity: 'NON_BREAKING',
                description: `Enum value added: ${value}`,
                path: `${schemaName}.${fieldName}`
              });
            }
          });
        }
        
        // Check format changes
        if (oldField.format !== newField.format) {
          changes.push({
            type: 'FIELD_FORMAT_CHANGED',
            schema: schemaName,
            field: fieldName,
            oldFormat: oldField.format,
            newFormat: newField.format,
            severity: 'BREAKING',
            description: `Field format changed: ${oldField.format || 'none'} → ${newField.format || 'none'}`,
            path: `${schemaName}.${fieldName}`
          });
        }
      }
    });
    
    // Check for new fields
    Object.keys(newProperties).forEach(fieldName => {
      if (!oldProperties[fieldName]) {
        const isRequired = newRequired.includes(fieldName);
        changes.push({
          type: 'FIELD_ADDED',
          schema: schemaName,
          field: fieldName,
          severity: isRequired ? 'BREAKING' : 'NON_BREAKING',
          description: `Added ${isRequired ? 'required' : 'optional'} field: ${fieldName}`,
          path: `${schemaName}.${fieldName}`
        });
      }
    });
    
    // Check required field changes
    oldRequired.forEach(fieldName => {
      if (!newRequired.includes(fieldName) && newProperties[fieldName]) {
        changes.push({
          type: 'FIELD_OPTIONAL',
          schema: schemaName,
          field: fieldName,
          severity: 'NON_BREAKING',
          description: `Field is now optional: ${fieldName}`,
          path: `${schemaName}.${fieldName}`
        });
      }
    });
    
    newRequired.forEach(fieldName => {
      if (!oldRequired.includes(fieldName) && oldProperties[fieldName]) {
        changes.push({
          type: 'FIELD_REQUIRED',
          schema: schemaName,
          field: fieldName,
          severity: 'BREAKING',
          description: `Field is now required: ${fieldName}`,
          path: `${schemaName}.${fieldName}`
        });
      }
    });
  });
  
  // Check for new schemas
  Object.keys(newSchemas).forEach(schemaName => {
    if (!oldSchemas[schemaName]) {
      changes.push({
        type: 'SCHEMA_ADDED',
        schema: schemaName,
        severity: 'NON_BREAKING',
        description: `New schema added: ${schemaName}`,
        path: schemaName
      });
    }
  });
  
  return changes;
}

// Find which services are affected by changes
export function findAffectedServices(changes, services) {
  const affected = [];
  
  services.forEach(service => {
    const breakingChanges = [];
    const warnings = [];
    
    service.dependencies.forEach(dependency => {
      const [schema, field] = dependency.split('.');
      
      changes.forEach(change => {
        if (change.schema === schema && 
            (change.field === field || change.type === 'SCHEMA_REMOVED')) {
          
          if (change.severity === 'BREAKING') {
            breakingChanges.push(change);
          } else {
            warnings.push(change);
          }
        }
      });
    });
    
    if (breakingChanges.length > 0 || warnings.length > 0) {
      affected.push({
        ...service,
        breakingChanges: breakingChanges.length,
        warnings: warnings.length,
        impactLevel: breakingChanges.length > 0 ? 'HIGH' : 'LOW',
        changes: [...breakingChanges, ...warnings]
      });
    }
  });
  
  return affected;
}

// Get summary of all changes
export function getChangeSummary(changes) {
  const breaking = changes.filter(c => c.severity === 'BREAKING').length;
  const nonBreaking = changes.filter(c => c.severity === 'NON_BREAKING').length;
  
  return {
    total: changes.length,
    breaking,
    nonBreaking,
    hasBreakingChanges: breaking > 0
  };
}

// Format change for display
export function formatChange(change) {
  if (change.description) {
    return change.description;
  }
  
  switch (change.type) {
    case 'FIELD_REMOVED':
      return `Removed field: ${change.field}`;
    case 'FIELD_ADDED':
      return `Added field: ${change.field}`;
    case 'FIELD_TYPE_CHANGED':
      return `${change.field}: ${change.oldType} → ${change.newType}`;
    case 'FIELD_REQUIRED':
      return `${change.field} is now required`;
    case 'FIELD_OPTIONAL':
      return `${change.field} is now optional`;
    case 'SCHEMA_REMOVED':
      return `Schema removed: ${change.schema}`;
    case 'SCHEMA_ADDED':
      return `Schema added: ${change.schema}`;
    case 'ENUM_VALUE_REMOVED':
      return `Enum value removed: ${change.value}`;
    case 'ENUM_VALUE_ADDED':
      return `Enum value added: ${change.value}`;
    case 'FIELD_FORMAT_CHANGED':
      return `Format changed: ${change.oldFormat || 'none'} → ${change.newFormat || 'none'}`;
    default:
      return 'Unknown change';
  }
}