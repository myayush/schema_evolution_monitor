// src/utils/deploymentOptimizer.js

export function calculateDeploymentOrder(affectedServices) {
  if (!affectedServices || affectedServices.length === 0) {
    return [];
  }

  // Calculate deployment score for each service
  const servicesWithScores = affectedServices.map(service => {
    let score = 0;
    
    // Factor 1: Breaking changes (higher = deploy later, more risky)
    const breakingChanges = service.breakingChanges || 0;
    score += breakingChanges * 10;
    
    // Factor 2: Service importance (critical services need special handling)
    if (service.importance === 'CRITICAL') {
      score += 5; // Deploy critical services early, but after safer services
    } else if (service.importance === 'HIGH') {
      score += 3;
    } else if (service.importance === 'MEDIUM') {
      score += 2;
    }
    // LOW importance gets score += 0 (deploy first - safest)
    
    // Factor 3: Call volume (higher traffic = more risk)
    const callsPerDay = service.callsPerDay || 0;
    if (callsPerDay > 40000) {
      score += 2; // High traffic services are riskier
    }
    
    return {
      ...service,
      deploymentScore: score
    };
  });

  // Sort by score (lower score = deploy earlier = safer)
  return servicesWithScores.sort((a, b) => a.deploymentScore - b.deploymentScore);
}

// Helper function to determine realistic service dependencies
function getServiceDependencies(currentService, allServices, deploymentOrder) {
  const serviceName = currentService.name;
  const currentIndex = deploymentOrder.findIndex(s => s.name === serviceName);
  
  // Define common service dependency patterns
  const dependencyMap = {
    'user-service': [],
    'auth-service': ['user-service'],
    'notification-service': ['user-service'],
    'order-service': ['user-service', 'auth-service'],
    'payment-service': ['order-service', 'user-service'],
    'inventory-service': ['product-service'],
    'analytics-service': ['user-service', 'order-service'],
    'reporting-service': ['user-service', 'order-service'],
    'search-service': ['user-service'],
    'shipping-service': ['order-service', 'user-service']
  };
  
  const potentialDeps = dependencyMap[serviceName] || [];
  const prerequisites = [];
  
  // Only include dependencies that:
  // 1. Are in our deployment list (affected services)
  // 2. Deploy before the current service
  potentialDeps.forEach(depName => {
    const depIndex = deploymentOrder.findIndex(s => s.name === depName);
    if (depIndex !== -1 && depIndex < currentIndex) {
      prerequisites.push(`${depName} deployed successfully`);
    }
  });
  
  // If no logical dependencies and not first service, depend on previous service
  if (prerequisites.length === 0 && currentIndex > 0) {
    const previousService = deploymentOrder[currentIndex - 1].name;
    prerequisites.push(`${previousService} deployed successfully`);
  }
  
  return prerequisites;
}

export function generateDeploymentPlan(orderedServices) {
  if (!orderedServices || orderedServices.length === 0) {
    return {
      totalSteps: 0,
      order: 'safe',
      steps: []
    };
  }

  const steps = orderedServices.map((service, index) => {
    const breakingChanges = service.breakingChanges || 0;
    const callsPerDay = service.callsPerDay || 0;
    
    // Generate contextual reasons
    let reason = '';
    if (index === 0) {
      reason = 'Lowest risk service - deploy first to validate process';
    } else if (service.importance === 'CRITICAL' && breakingChanges > 0) {
      reason = 'Critical service with breaking changes - deploy with full team monitoring';
    } else if (breakingChanges > 2) {
      reason = 'Multiple breaking changes - high risk deployment';
    } else if (callsPerDay > 40000) {
      reason = 'High traffic service - deploy during low usage hours';
    } else if (service.importance === 'LOW') {
      reason = 'Low priority service - safe to deploy last';
    } else {
      reason = 'Standard deployment - monitor service health after changes';
    }

    // Get realistic prerequisites based on service dependencies
    const prerequisites = getServiceDependencies(service, orderedServices, orderedServices);

    // Calculate risk level
    let estimatedRisk = 'LOW';
    if (breakingChanges > 2 || (service.importance === 'CRITICAL' && breakingChanges > 0)) {
      estimatedRisk = 'HIGH';
    } else if (breakingChanges > 0 || callsPerDay > 30000) {
      estimatedRisk = 'MEDIUM';
    }

    return {
      step: index + 1,
      service: service.name,
      reason: reason,
      impact: service.impactLevel || 'MEDIUM',
      importance: service.importance,
      breakingChanges: breakingChanges,
      prerequisites: prerequisites,
      estimatedRisk: estimatedRisk
    };
  });

  return {
    totalSteps: steps.length,
    order: 'optimized',
    steps: steps,
    recommendations: [
      'Deploy during low traffic hours',
      'Monitor each service after deployment', 
      'Have rollback plan ready',
      'Test schema compatibility before deployment'
    ]
  };
}