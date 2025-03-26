import React from "react";
// import "../../App.css";
import { LinkGridItem } from "../../interfaces/LinkGridItem";
import { GridSettings } from "../../interfaces/GridSettings";

interface LinkGridProps {
  gridSettings: GridSettings;
  links: LinkGridItem[];
}

const LinkGrid: React.FC<LinkGridProps> = ({ gridSettings, links }) => {
  const gridStyle = {
    display: "grid",
    gridTemplateRows: `repeat(${gridSettings.rows}, 1fr)`,
    gridTemplateColumns: `repeat(${gridSettings.columns}, minmax(0, 1fr))`,
    gap: "0px",
  };

  return (
    <div className="link-grid" style={gridStyle}>
      {links.map((link, index) => (
        <a
          key={index}
          className="link-grid-item"
          href={link.url}
          style={{
            backgroundImage: `url(data:image/png;base64,${link.imageData})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="link-grid-item-content">
            <h2>{link.title}</h2>
          </div>
        </a>
      ))}
    </div>
  );
};

export default LinkGrid;
