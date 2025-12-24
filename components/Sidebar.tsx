
import React, { useState, useRef, useEffect } from 'react';
import { TimelineLayer } from '../types';
import { Layers, Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';

interface SidebarProps {
  layers: TimelineLayer[];
  onAddLayer: (name: string) => void;
  onUpdateLayer: (id: string, name: string) => void;
  onDeleteLayer: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ layers, onAddLayer, onUpdateLayer, onDeleteLayer, isOpen, onClose }) => {
  const [newLayerName, setNewLayerName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLayerName.trim()) {
      onAddLayer(newLayerName.trim());
      setNewLayerName('');
      setIsAdding(false);
    }
  };

  const startEdit = (layer: TimelineLayer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
    setDeleteConfirmId(null);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdateLayer(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDeleteLayer(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setEditingId(null);
      // Auto-clear confirm state after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 flex flex-col h-full z-[70] transition-transform duration-300 ease-in-out
    lg:relative lg:translate-x-0 lg:w-64 lg:z-30
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <div className={sidebarClasses}>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Layers size={18} className="text-blue-600" /> Layers
        </h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsAdding(true)}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
            title="Add Layer"
          >
            <Plus size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 lg:hidden transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`group flex items-center justify-between p-3 rounded-xl transition-all h-20 border ${
              deleteConfirmId === layer.id 
                ? 'bg-red-50 border-red-100' 
                : editingId === layer.id 
                  ? 'bg-blue-50 border-blue-100'
                  : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
            }`}
          >
            {editingId === layer.id ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="w-full text-sm p-1.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-100 rounded">
                  <Check size={16} />
                </button>
                <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded">
                  <X size={16} />
                </button>
              </div>
            ) : deleteConfirmId === layer.id ? (
               <div className="flex items-center justify-between w-full">
                 <span className="text-sm font-bold text-red-600 flex items-center gap-2">
                   <AlertCircle size={14} /> Confirm?
                 </span>
                 <div className="flex gap-1">
                   <button 
                      onClick={() => handleDeleteClick(layer.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                   >
                     Delete
                   </button>
                   <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 text-gray-500 text-xs font-semibold hover:bg-gray-200 rounded"
                   >
                     Cancel
                   </button>
                 </div>
               </div>
            ) : (
              <>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-1.5 h-10 rounded-full bg-blue-100 group-hover:bg-blue-300 transition-colors flex-shrink-0"></div>
                  <span className="text-sm font-semibold text-gray-700 truncate" title={layer.name}>
                    {layer.name}
                  </span>
                </div>
                {/* Actions: Always visible on mobile, hover on desktop */}
                <div className="flex opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button 
                    onClick={() => startEdit(layer)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Rename"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(layer.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {isAdding && (
          <form onSubmit={handleAdd} className="mt-2 p-2 bg-white border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <input
              autoFocus
              type="text"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              onBlur={() => !newLayerName && setIsAdding(false)}
              className="w-full text-sm p-3 bg-white border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Layer Name..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
          Chronos v1.0 • Built with Passion
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
