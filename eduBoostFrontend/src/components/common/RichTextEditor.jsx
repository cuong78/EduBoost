import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { questionBankService } from '../../services/questionBankService';
import { API } from '../../constants/api';
import { showErrorToast } from '../../utils/show-toast';

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung...' }) => {
    const quillRef = useRef(null);

    // Custom handler: insert LaTeX expression wrapped in $...$
    function latexHandler() {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const range = quill.getSelection(true);
        const selectedText = range.length > 0 ? quill.getText(range.index, range.length) : '';
        
        const latex = prompt(
            'Nhập biểu thức LaTeX\n\nVí dụ: x^{2}+3x-5, \\frac{a}{b}, \\sqrt{x}',
            selectedText || ''
        );
        if (latex === null) return; // cancelled
        
        // Replace selected text (or insert at cursor) with $latex$
        if (range.length > 0) {
            quill.deleteText(range.index, range.length);
        }
        quill.insertText(range.index, `$${latex}$`);
        quill.setSelection(range.index + latex.length + 2);
    }

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
                const objectKey = response.imageUrl || response.url;
                const imageUrl = `${API.BASE}/files/${objectKey}`;

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

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['image'],
                ['latex'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                latex: latexHandler,
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

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
                /* Custom LaTeX button styling */
                .ql-latex::after {
                    content: 'Tₓ';
                    font-weight: 700;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
