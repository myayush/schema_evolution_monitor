import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './DependencyGraph3D.css';

function DependencyGraph3D({ services, affectedServices }) {
  const svgRef = useRef(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Don't render if we don't have data
    if (!services || !svgRef.current) {
      return;
    }

    // Clear any existing visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up the canvas size
    const containerElement = svgRef.current.parentNode;
    const canvasWidth = containerElement.clientWidth;
    const canvasHeight = 450;

    // Step 1: Create nodes (circles) for each service
    const graphNodes = [];
    services.forEach(service => {
      const isThisServiceAffected = affectedServices.find(affectedService => 
        affectedService.name === service.name
      );
      
      const nodeData = {
        id: service.name,
        name: service.name,
        isAffected: isThisServiceAffected ? true : false,
        importance: service.importance,
        callsPerDay: service.callsPerDay,
        dependencies: service.dependencies,
        serviceDependencies: service.serviceDependencies
      };
      
      graphNodes.push(nodeData);
    });

    // Step 2: Create links (arrows) between services that depend on each other
    const graphLinks = [];
    services.forEach(service => {
      const serviceDependencies = service.serviceDependencies || [];
      
      serviceDependencies.forEach(dependencyName => {
        // Check if the dependency exists in our services list
        const dependencyExists = services.find(s => s.name === dependencyName);
        
        if (dependencyExists) {
          const linkData = {
            source: service.name,  // Service that depends on something
            target: dependencyName // Service that is depended upon
          };
          graphLinks.push(linkData);
        }
      });
    });

    // Step 3: Create the SVG canvas
    const svgCanvas = d3.select(svgRef.current)
      .attr("width", canvasWidth)
      .attr("height", canvasHeight)
      .attr("viewBox", [0, 0, canvasWidth, canvasHeight]);

    // Add a background color
    svgCanvas.append("rect")
      .attr("width", canvasWidth)
      .attr("height", canvasHeight)
      .attr("fill", "#f8fafc");

    // Step 4: Set up the physics simulation (makes nodes push apart and links pull together)
    const physicsSimulation = d3.forceSimulation(graphNodes)
      .force("link", d3.forceLink(graphLinks).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-500))  // Nodes repel each other
      .force("center", d3.forceCenter(canvasWidth / 2, canvasHeight / 2));  // Center everything

    // Step 5: Create arrow markers for the links
    const arrowDefinitions = svgCanvas.append("defs");
    
    // Red arrows for affected services
    arrowDefinitions.append("marker")
      .attr("id", "arrow-affected")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#e53e3e");

    // Gray arrows for safe services
    arrowDefinitions.append("marker")
      .attr("id", "arrow-safe")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#718096");

    // Step 6: Draw the links (lines with arrows)
    const linkElements = svgCanvas.append("g")
      .selectAll("line")
      .data(graphLinks)
      .join("line")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7)
      .each(function(linkData) {
        // Figure out if this link involves affected services
        const sourceService = affectedServices.find(s => 
          s.name === linkData.source.id || s.name === linkData.source
        );
        const targetService = affectedServices.find(s => 
          s.name === linkData.target.id || s.name === linkData.target
        );
        
        const isLinkAffected = sourceService || targetService;
        
        // Set color and arrow type based on whether services are affected
        if (isLinkAffected) {
          d3.select(this)
            .attr("stroke", "#e53e3e")
            .attr("marker-end", "url(#arrow-affected)");
        } else {
          d3.select(this)
            .attr("stroke", "#718096")
            .attr("marker-end", "url(#arrow-safe)");
        }
      });

    // Step 7: Create node groups (each node will have a circle and text)
    const nodeGroups = svgCanvas.append("g")
      .selectAll("g")
      .data(graphNodes)
      .join("g")
      .style("cursor", "pointer");

    // Step 8: Add glow effect for affected services
    nodeGroups
      .filter(nodeData => nodeData.isAffected)
      .append("circle")
      .attr("r", 28)
      .attr("fill", "none")
      .attr("stroke", "#e53e3e")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.3);

    // Step 9: Add the main circles for each service
    nodeGroups.append("circle")
      .attr("r", 20)
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .each(function(nodeData) {
        // Color the circle based on whether service is affected
        if (nodeData.isAffected) {
          d3.select(this).attr("fill", "#e53e3e");  // Red for affected
        } else {
          d3.select(this).attr("fill", "#38a169");  // Green for safe
        }
      });

    // Step 10: Add service name labels below each circle
    nodeGroups.append("text")
      .attr("dy", 35)  // Position below the circle
      .attr("text-anchor", "middle")  // Center the text
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#1a202c")
      .text(nodeData => nodeData.name);

    // Step 11: Make nodes draggable
    const dragBehavior = d3.drag()
      .on("start", function(event, nodeData) {
        // When drag starts, heat up the simulation
        if (!event.active) {
          physicsSimulation.alphaTarget(0.3).restart();
        }
        // Fix the node position
        nodeData.fx = nodeData.x;
        nodeData.fy = nodeData.y;
      })
      .on("drag", function(event, nodeData) {
        // Update node position as we drag
        nodeData.fx = event.x;
        nodeData.fy = event.y;
      })
      .on("end", function(event, nodeData) {
        // When drag ends, cool down the simulation
        if (!event.active) {
          physicsSimulation.alphaTarget(0);
        }
        // Release the fixed position so physics can take over
        nodeData.fx = null;
        nodeData.fy = null;
      });

    // Apply drag behavior to nodes
    nodeGroups.call(dragBehavior);

    // Step 12: Handle clicking on nodes
    nodeGroups.on("click", function(event, nodeData) {
      event.stopPropagation();  // Don't trigger canvas click
      setSelectedService(nodeData);
    });

    // Step 13: Handle clicking on empty space (deselect)
    svgCanvas.on("click", function() {
      setSelectedService(null);
    });

    // Step 14: Update positions when physics simulation runs
    physicsSimulation.on("tick", function() {
      // Update link positions
      linkElements
        .attr("x1", linkData => linkData.source.x)
        .attr("y1", linkData => linkData.source.y)
        .attr("x2", linkData => linkData.target.x)
        .attr("y2", linkData => linkData.target.y);

      // Update node positions
      nodeGroups.attr("transform", nodeData => {
        return `translate(${nodeData.x},${nodeData.y})`;
      });
    });

    // Cleanup function - stop simulation when component unmounts
    return function cleanup() {
      physicsSimulation.stop();
    };

  }, [services, affectedServices]);

  // Render the component
  return (
    <div className="dependency-graph-container">
      {/* Header with title and legend */}
      <div className="graph-header">
        <h3>Service Dependencies</h3>
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-dot safe"></div>
            <span>Safe Services</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot affected"></div>
            <span>Affected Services</span>
          </div>
        </div>
      </div>
      
      {/* Main graph area */}
      <div className="graph-wrapper">
        <svg ref={svgRef}></svg>
        
        {/* Service details panel (shows when a service is selected) */}
        {selectedService && (
          <div className="service-details">
            <div className="details-header">
              <h4>{selectedService.name}</h4>
              <button 
                className="close-btn"
                onClick={() => setSelectedService(null)}
              >
                ✕
              </button>
            </div>
            <div className="details-content">
              <div className="detail-item">
                <strong>Status:</strong> 
                <span className={`status ${selectedService.isAffected ? 'affected' : 'safe'}`}>
                  {selectedService.isAffected ? 'Affected by Schema Changes' : 'Safe from Changes'}
                </span>
              </div>
              
              <div className="detail-item">
                <strong>Schema Dependencies:</strong>
                <ul className="dependencies-list">
                  {selectedService.dependencies && selectedService.dependencies.length > 0 ? (
                    selectedService.dependencies.map((dependency, index) => (
                      <li key={index}>{dependency}</li>
                    ))
                  ) : (
                    <li>No schema dependencies</li>
                  )}
                </ul>
              </div>
              
              <div className="detail-item">
                <strong>Service Dependencies:</strong>
                <ul className="dependencies-list">
                  {selectedService.serviceDependencies && selectedService.serviceDependencies.length > 0 ? (
                    selectedService.serviceDependencies.map((dependency, index) => (
                      <li key={index}>{dependency}</li>
                    ))
                  ) : (
                    <li>No service dependencies</li>
                  )}
                </ul>
              </div>
              
              <div className="detail-item">
                <strong>Importance Level:</strong> {selectedService.importance}
              </div>
              
              {selectedService.callsPerDay && (
                <div className="detail-item">
                  <strong>Daily API Calls:</strong> {selectedService.callsPerDay.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions for users */}
      <div className="graph-instructions">
        <p>🖱️ Drag nodes to rearrange • Click nodes for details</p>
      </div>
    </div>
  );
}

export default DependencyGraph3D;