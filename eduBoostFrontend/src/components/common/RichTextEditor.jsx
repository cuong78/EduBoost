import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { questionBankService } from '../../services/questionBankService';
import { showErrorToast } from '../../utils/show-toast';

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung...' }) => {
    const quillRef = useRef(null);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['formula', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                formula: formulaHandler
            }
        },
        formula: true,
        clipboard: {
            matchVisual: false
        }
    }), []);

    function imageHandler() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const response = await questionBankService.uploadImage(file);
                const imageUrl = response.url;

                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', imageUrl);
                    quill.setSelection(range.index + 1);
                }
            } catch (error) {
                showErrorToast('Lỗi upload ảnh: ' + (error?.message || 'Không xác định'));
            }
        };
    }

    function formulaHandler() {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        const formula = prompt('Nhập công thức LaTeX (ví dụ: x^2 + y^2 = r^2):');
        if (formula && formula.trim()) {
            // Insert as LaTeX with $ delimiters
            quill.insertText(range.index, `$${formula.trim()}$`, 'user');
            quill.setSelection(range.index + formula.trim().length + 2);
        }
    }

    return (
        <div className="rich-text-editor">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
            />
            <style>{`
                .rich-text-editor .ql-editor {
                    min-height: 200px;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #999;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
