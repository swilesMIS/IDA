import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { AccessLevel } from "../../interfaces/DatabaseInterfaces";
import pencilIcon from "../../assets/icons/pencil-fill.svg";
import EditModal from "../EditModal/EditModal";

interface AccessLevelEditorProps {
  accessLevels: AccessLevel[];
  editingAccessLevelIndex: number | null;
  startEditingAccessLevel: (index: number) => void;
  stopEditingAccessLevel: () => void;
  onUpdate: (index: number, updatedLevel: AccessLevel) => void;
}

export const AccessLevelEditor: React.FC<AccessLevelEditorProps> = ({
  accessLevels,
  editingAccessLevelIndex,
  startEditingAccessLevel,
  stopEditingAccessLevel,
  onUpdate,
}) => {
  const [tempAccessLevel, setTempAccessLevel] = useState<AccessLevel | null>(
    null,
  );

  const beginEdit = (index: number) => {
    const currentAccessLevel = accessLevels[index];
    setTempAccessLevel(currentAccessLevel);
    startEditingAccessLevel(index);
  };

  const confirmEdit = () => {
    if (editingAccessLevelIndex !== null && tempAccessLevel) {
      onUpdate(editingAccessLevelIndex, tempAccessLevel!);
      setTempAccessLevel(null);
      stopEditingAccessLevel();
    }
  };

  return (
    <section className="access-levels">
      <h2 className="data-header">Access Levels and Conditions</h2>
      {accessLevels.map((level, index) => (
        <div key={level.accessLevelID} className="access-level">
          <div className="access-level-header">
            <span>{level.name} </span>
            <img
              src={pencilIcon}
              alt="Edit"
              onClick={() => beginEdit(index)}
              style={{ cursor: "pointer" }}
            />
          </div>
          <p>{level.description}</p>

          <EditModal
            isOpen={editingAccessLevelIndex !== null}
            onClose={() => {
              setTempAccessLevel(null);
              stopEditingAccessLevel();
            }}
            onConfirm={confirmEdit}
          >
            {tempAccessLevel && (
              <>
                <TextareaAutosize
                  className="modal-textarea"
                  placeholder="Enter access level name..."
                  value={tempAccessLevel.name}
                  onChange={(e) =>
                    setTempAccessLevel({
                      ...tempAccessLevel,
                      name: e.target.value,
                    })
                  }
                />
                <TextareaAutosize
                  className="modal-textarea"
                  placeholder="Enter access level description..."
                  value={tempAccessLevel.description}
                  onChange={(e) =>
                    setTempAccessLevel({
                      ...tempAccessLevel,
                      description: e.target.value,
                    })
                  }
                />
              </>
            )}
          </EditModal>
        </div>
      ))}
    </section>
  );
};

// export const AccessLevelEditor: React.FC<AccessLevelEditorProps> = ({
//   accessLevels,
//   editingAccessLevelIndex,
//   startEditingAccessLevel,
//   stopEditingAccessLevel,
//   onUpdate,
// }) => {
//   return (
//     <section className="access-levels">
//       <h2 className="data-header">Access Levels and Conditions</h2>
//       <br />
//       {accessLevels.map((level, index) => (
//         <div key={level.accessLevelID} className="access-level">
//           <div className="access-level-header">
//             {editingAccessLevelIndex === index ? (
//               <TextareaAutosize
//                 placeholder="Enter a description..."
//                 style={{ all: "unset", width: "100%" }}
//                 value={level.name}
//                 onChange={(e) =>
//                   onUpdate(index, { ...level, name: e.target.value })
//                 }
//                 onBlur={stopEditingAccessLevel}
//               />
//             ) : (
//               <span onClick={() => startEditingAccessLevel(index)}>
//                 {level.name}
//               </span>
//             )}
//             <img
//               src={pencilIcon}
//               alt="Edit"
//               onClick={() => startEditingAccessLevel(index)}
//               style={{ cursor: "pointer", float: "right" }}
//             />
//           </div>
//           <p>
//             {editingAccessLevelIndex === index ? (
//               <TextareaAutosize
//                 placeholder="Enter a description..."
//                 style={{ all: "unset", width: "100%" }}
//                 value={level.description}
//                 onChange={(e) =>
//                   onUpdate(index, { ...level, description: e.target.value })
//                 }
//                 onBlur={stopEditingAccessLevel}
//               />
//             ) : (
//               <span>{level.description}</span>
//             )}
//           </p>
//         </div>
//       ))}
//     </section>
//   );
// };
