import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ListeningFormModal({ isOpen, onClose, initialData, onSubmit }) {
  const [activeFormTab, setActiveFormTab] = useState('general');

  const [formTitleJa, setFormTitleJa] = useState('');
  const [formTitleVi, setFormTitleVi] = useState('');
  const [formJlpt, setFormJlpt] = useState('N3');
  const [formType, setFormType] = useState('task');
  const [formDuration, setFormDuration] = useState(60);
  const [formAudioUrl, setFormAudioUrl] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formScriptJa, setFormScriptJa] = useState('');
  const [formScriptVi, setFormScriptVi] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formQuestions, setFormQuestions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormTitleJa(initialData.titleJa || '');
        setFormTitleVi(initialData.titleVi || '');
        setFormJlpt(initialData.jlpt || 'N3');
        setFormType(initialData.type || 'task');
        setFormDuration(initialData.duration || 60);
        setFormAudioUrl(initialData.audioUrl || '');
        setFormImage(initialData.image || '');
        setFormDisplayOrder(initialData.displayOrder || 1);
        setFormScriptJa(initialData.scriptJa || '');
        setFormScriptVi(initialData.scriptVi || '');
        setFormIsPublished(initialData.isPublished !== false);
        
        const mappedQuestions = (initialData.questions || []).map(q => ({
          questionVi: q.questionVi || '',
          questionJa: q.questionJa || '',
          choices: q.choices && q.choices.length === 4 ? [...q.choices] : ['', '', '', ''],
          choiceImages: q.choiceImages && q.choiceImages.length === 4 ? [...q.choiceImages] : ['', '', '', ''],
          answerIndex: typeof q.answerIndex === 'number' ? q.answerIndex : 0,
          explainVi: q.explainVi || ''
        }));
        setFormQuestions(mappedQuestions.length > 0 ? mappedQuestions : [
          { questionVi: '', questionJa: '', choices: ['', '', '', ''], choiceImages: ['', '', '', ''], answerIndex: 0, explainVi: '' }
        ]);
      } else {
        setFormTitleJa('');
        setFormTitleVi('');
        setFormJlpt('N3');
        setFormType('task');
        setFormDuration(60);
        setFormAudioUrl('');
        setFormImage('');
        setFormDisplayOrder(1);
        setFormScriptJa('');
        setFormScriptVi('');
        setFormIsPublished(true);
        setFormQuestions([
          { questionVi: '', questionJa: '', choices: ['', '', '', ''], choiceImages: ['', '', '', ''], answerIndex: 0, explainVi: '' }
        ]);
      }
      setActiveFormTab('general');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAudioFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File âm thanh quá lớn! Giới hạn tối đa là 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormAudioUrl(uploadEvent.target.result);
      toast.success('Đã tải và đính kèm file âm thanh thành công!');
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh minh họa quá lớn! Giới hạn tối đa là 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormImage(uploadEvent.target.result);
      toast.success('Đã tải ảnh minh họa bài nghe thành công!');
    };
    reader.readAsDataURL(file);
  };

  const handleChoiceImageUpload = (qIndex, cIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh đáp án quá lớn! Giới hạn tối đa là 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const updated = [...formQuestions];
      if (!updated[qIndex].choiceImages) updated[qIndex].choiceImages = ['', '', '', ''];
      updated[qIndex].choiceImages[cIndex] = uploadEvent.target.result;
      setFormQuestions(updated);
      toast.success(`Đã tải ảnh cho đáp án ${cIndex + 1} thành công!`);
    };
    reader.readAsDataURL(file);
  };

  const handleAddQuestion = () => {
    setFormQuestions(prev => [
      ...prev,
      { questionVi: '', questionJa: '', choices: ['', '', '', ''], choiceImages: ['', '', '', ''], answerIndex: 0, explainVi: '' }
    ]);
    toast.success('Đã thêm 1 câu hỏi mới!');
  };

  const handleRemoveQuestion = (index) => {
    if (formQuestions.length <= 1) {
      toast.error('Một bài luyện nghe phải chứa ít nhất 1 câu hỏi!');
      return;
    }
    setFormQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, val) => {
    const updated = [...formQuestions];
    updated[index][field] = val;
    setFormQuestions(updated);
  };

  const handleChoiceChange = (qIndex, cIndex, val) => {
    const updated = [...formQuestions];
    updated[qIndex].choices[cIndex] = val;
    setFormQuestions(updated);
  };

  const handleChoiceImageChange = (qIndex, cIndex, val) => {
    const updated = [...formQuestions];
    if (!updated[qIndex].choiceImages) updated[qIndex].choiceImages = ['', '', '', ''];
    updated[qIndex].choiceImages[cIndex] = val;
    setFormQuestions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTitleVi.trim()) { toast.error('Vui lòng điền tiêu đề tiếng Việt.'); return; }
    if (!formAudioUrl.trim()) { toast.error('Vui lòng cung cấp file âm thanh hoặc đường dẫn YouTube.'); return; }
    if (!formScriptJa.trim()) { toast.error('Vui lòng điền kịch bản hội thoại tiếng Nhật.'); return; }

    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i];
      const hasText = q.choices.some(c => c.trim());
      const hasImg = q.choiceImages.some(img => img.trim());
      if (!hasText && !hasImg) {
        toast.error(`Câu hỏi số ${i + 1} phải có ít nhất 1 đáp án chữ hoặc ảnh.`);
        return;
      }
    }

    const payload = {
      titleJa: formTitleJa.trim(),
      titleVi: formTitleVi.trim(),
      jlpt: formJlpt,
      type: formType,
      duration: Number(formDuration) || 60,
      audioUrl: formAudioUrl.trim(),
      image: formImage.trim(),
      scriptJa: formScriptJa.trim(),
      scriptVi: formScriptVi.trim(),
      isPublished: Boolean(formIsPublished),
      displayOrder: Number(formDisplayOrder) || 1,
      questions: formQuestions
    };

    onSubmit(payload);
  };

  return (
    <div className="admin-grammar-modal-backdrop" onClick={onClose}>
      <div 
        className="kaiwa-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="admin-grammar-modal-header">
          <h2>{initialData ? 'SỬA BÀI LUYỆN NGHE CHOUKAI' : 'THÊM BÀI LUYỆN NGHE CHOUKAI'}</h2>
          <button type="button" className="admin-grammar-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="kaiwa-modal-tabs">
          <button type="button" className={`kaiwa-modal-tab-btn ${activeFormTab === 'general' ? 'kaiwa-modal-tab-btn--active' : ''}`} onClick={() => setActiveFormTab('general')}>1. Thông tin chung</button>
          <button type="button" className={`kaiwa-modal-tab-btn ${activeFormTab === 'script' ? 'kaiwa-modal-tab-btn--active' : ''}`} onClick={() => setActiveFormTab('script')}>2. Kịch bản & Dịch nghĩa</button>
          <button type="button" className={`kaiwa-modal-tab-btn ${activeFormTab === 'questions' ? 'kaiwa-modal-tab-btn--active' : ''}`} onClick={() => setActiveFormTab('questions')}>3. Câu hỏi trắc nghiệm</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="admin-grammar-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {/* General info tab */}
            {activeFormTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-grammar-row-2" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                  <div className="admin-grammar-field" style={{ marginBottom: 0 }}>
                    <label className="admin-grammar-label">Tiêu đề tiếng Việt <span className="admin-grammar-req">*</span></label>
                    <input type="text" className="admin-grammar-input" value={formTitleVi} onChange={(e) => setFormTitleVi(e.target.value)} placeholder="Ví dụ: Thủ tục đăng ký cư trú tại quận" required />
                  </div>
                  <div className="admin-grammar-field" style={{ marginBottom: 0 }}>
                    <label className="admin-grammar-label">Tiêu đề tiếng Nhật</label>
                    <input type="text" className="admin-grammar-input" value={formTitleJa} onChange={(e) => setFormTitleJa(e.target.value)} placeholder="Ví dụ: 区役所での手続きの説明" lang="ja" />
                  </div>
                </div>

                <div className="admin-grammar-row-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Cấp độ JLPT</label>
                    <select className="kaiwa-form-select" value={formJlpt} onChange={(e) => setFormJlpt(e.target.value)}>
                      {['N1', 'N2', 'N3', 'N4', 'N5'].map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </div>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Dạng bài</label>
                    <select className="kaiwa-form-select" value={formType} onChange={(e) => setFormType(e.target.value)}>
                      <option value="task">Hiểu nhiệm vụ (課題理解)</option>
                      <option value="point">Hiểu chi tiết (ポイント理解)</option>
                      <option value="summary">Hiểu khái quát (概要理解)</option>
                      <option value="utterance">Biểu đạt tình huống (発話表現)</option>
                      <option value="response">Phản xạ nhanh (即時応答)</option>
                    </select>
                  </div>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Thời lượng (giây)</label>
                    <input type="number" className="kaiwa-form-input" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} min="0" />
                  </div>
                </div>

                <div className="kaiwa-form-row" style={{ gridTemplateColumns: '2fr 1.5fr 0.5fr', alignItems: 'flex-end', gap: '12px' }}>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Đường dẫn Audio (URL) <span className="kaiwa-form-req">*</span></label>
                    <input type="text" className="kaiwa-form-input" value={formAudioUrl} onChange={(e) => setFormAudioUrl(e.target.value)} placeholder="Nhập link .mp3..." required />
                  </div>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Hoặc tải file từ máy</label>
                    <label className="kaiwa-upload-label">
                      <input type="file" accept="audio/*" onChange={handleAudioFileUpload} style={{ display: 'none' }} />
                      <span>{formAudioUrl && formAudioUrl.startsWith('data:') ? '✓ Đã tải Audio' : 'Chọn tệp âm thanh'}</span>
                    </label>
                  </div>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Thứ tự</label>
                    <input type="number" className="kaiwa-form-input" value={formDisplayOrder} onChange={(e) => setFormDisplayOrder(e.target.value)} min="1" />
                  </div>
                </div>

                <div className="kaiwa-form-row" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Hình ảnh đính kèm bài nghe (URL)</label>
                    <input type="text" className="kaiwa-form-input" value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="Ví dụ: https://link-anh-minh-hoa.png" />
                  </div>
                  <div className="kaiwa-form-field">
                    <label className="kaiwa-form-label">Hoặc tải ảnh từ máy tính</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label className="kaiwa-upload-label" style={{ flex: 1 }}>
                        <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: 'none' }} />
                        <span>{formImage && formImage.startsWith('data:') ? '✓ Đã tải ảnh minh họa' : 'Chọn tệp hình ảnh'}</span>
                      </label>
                      {formImage && (
                        <button type="button" className="admin-grammar-btn admin-grammar-btn--ghost" style={{ color: '#dc3545', height: '42px', padding: '0 12px' }} onClick={() => setFormImage('')}>Xóa ảnh</button>
                      )}
                    </div>
                  </div>
                </div>

                {formImage && (
                  <div style={{ padding: '12px', background: 'rgba(90, 107, 56, 0.04)', borderRadius: '10px', border: '1px dashed rgba(90, 107, 56, 0.2)', textAlign: 'center' }}>
                    <img src={formImage} alt="Xem trước bài nghe" style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} />
                  </div>
                )}

                <div className="kaiwa-form-field" style={{ marginTop: '6px' }}>
                  <div className="admin-grammar-switch-wrap">
                    <button type="button" className={`admin-grammar-switch ${formIsPublished ? 'admin-grammar-switch--on' : ''}`} onClick={() => setFormIsPublished(!formIsPublished)}>
                      <span className="admin-grammar-switch-thumb"></span>
                    </button>
                    <span className="admin-grammar-switch-caption">{formIsPublished ? 'Xuất bản công khai (Học viên có thể học ngay)' : 'Lưu bản nháp (Ẩn với học viên)'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Script Tab */}
            {activeFormTab === 'script' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-grammar-field">
                  <label className="admin-grammar-label">Bản gốc hội thoại tiếng Nhật (Script) <span className="admin-grammar-req">*</span></label>
                  <textarea className="admin-grammar-textarea" style={{ minHeight: '180px', fontFamily: 'var(--font-jp)' }} value={formScriptJa} onChange={(e) => setFormScriptJa(e.target.value)} placeholder="Nhập kịch bản ghi âm gốc (bằng tiếng Nhật)..." lang="ja" required />
                </div>
                <div className="admin-grammar-field">
                  <label className="admin-grammar-label">Bản dịch tiếng Việt nghĩa hội thoại</label>
                  <textarea className="admin-grammar-textarea" style={{ minHeight: '180px' }} value={formScriptVi} onChange={(e) => setFormScriptVi(e.target.value)} placeholder="Nhập nội dung dịch nghĩa hội thoại (bằng tiếng Việt)..." />
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeFormTab === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {formQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="kaiwa-question-builder-card">
                    <div className="kaiwa-qb-header">
                      <span className="kaiwa-qb-title">CÂU HỎI TRẮC NGHIỆM #{qIndex + 1}</span>
                      <button type="button" className="kaiwa-qb-remove-btn" onClick={() => handleRemoveQuestion(qIndex)}>Xóa câu hỏi này</button>
                    </div>

                    <div className="admin-grammar-row-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div className="admin-grammar-field" style={{ marginBottom: 0 }}>
                        <label className="admin-grammar-label">Nội dung câu hỏi (tiếng Việt)</label>
                        <input type="text" className="admin-grammar-input" value={q.questionVi} onChange={(e) => handleQuestionChange(qIndex, 'questionVi', e.target.value)} placeholder="Ví dụ: Người đàn ông phải làm gì đầu tiên?" />
                      </div>
                      <div className="admin-grammar-field" style={{ marginBottom: 0 }}>
                        <label className="admin-grammar-label">Nội dung câu hỏi (tiếng Nhật)</label>
                        <input type="text" className="admin-grammar-input" value={q.questionJa} onChange={(e) => handleQuestionChange(qIndex, 'questionJa', e.target.value)} placeholder="Ví dụ: 男の人はまず何をしますか？" lang="ja" />
                      </div>
                    </div>

                    <label className="admin-grammar-label" style={{ marginBottom: '8px' }}>Lựa chọn đáp án & Tích chọn đáp án đúng <span className="admin-grammar-req">*</span></label>
                    <div className="kaiwa-choice-builder-grid" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                      {q.choices.map((choice, cIndex) => (
                        <div key={cIndex} className="kaiwa-choice-builder-item" style={{ background: 'rgba(255, 252, 246, 0.4)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(90, 107, 56, 0.15)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input type="radio" name={`q_${qIndex}_answer`} className="kaiwa-choice-radio" checked={q.answerIndex === cIndex} onChange={() => handleQuestionChange(qIndex, 'answerIndex', cIndex)} style={{ width: '18px', height: '18px' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--admin-ink-soft)' }}>#{cIndex + 1}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input type="text" className="admin-grammar-input" style={{ padding: '8px 12px', fontSize: '0.82rem', flex: 1, borderColor: q.answerIndex === cIndex ? '#28a745' : '', backgroundColor: q.answerIndex === cIndex ? 'rgba(40, 167, 69, 0.03)' : '' }} value={choice} onChange={(e) => handleChoiceChange(qIndex, cIndex, e.target.value)} placeholder={`Nhập đáp án chữ thứ ${cIndex + 1}...`} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--admin-ink-soft)', whiteSpace: 'nowrap' }}>Ảnh đáp án:</span>
                              <input type="text" className="admin-grammar-input" style={{ padding: '4px 8px', fontSize: '0.75rem', height: '30px', flex: 1 }} value={q.choiceImages?.[cIndex] || ''} onChange={(e) => handleChoiceImageChange(qIndex, cIndex, e.target.value)} placeholder="URL ảnh đáp án..." />
                              <label className="kaiwa-upload-label" style={{ height: '30px', padding: '0 10px', fontSize: '0.72rem', width: 'auto' }}>
                                <input type="file" accept="image/*" onChange={(e) => handleChoiceImageUpload(qIndex, cIndex, e)} style={{ display: 'none' }} />
                                <span>{q.choiceImages?.[cIndex] && q.choiceImages[cIndex].startsWith('data:') ? '✓ Đã tải' : 'Tải ảnh'}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="admin-grammar-row-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <div className="admin-grammar-field" style={{ marginBottom: 0 }}>
                        <label className="admin-grammar-label">Giải thích chi tiết (tiếng Việt)</label>
                        <input type="text" className="admin-grammar-input" style={{ padding: '7px 10px', fontSize: '0.8rem' }} value={q.explainVi} onChange={(e) => handleQuestionChange(qIndex, 'explainVi', e.target.value)} placeholder="Giải thích vì sao chọn đáp án này..." />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="admin-grammar-btn admin-grammar-btn--ghost" style={{ borderStyle: 'dashed', borderWidth: '2px', padding: '12px', marginTop: '8px' }} onClick={handleAddQuestion}>+ Thêm Câu Hỏi Mới</button>
              </div>
            )}
          </div>

          <div className="admin-grammar-modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8f9fa' }}>
            <button type="button" className="admin-grammar-btn admin-grammar-btn--ghost" onClick={onClose}>Hủy bỏ</button>
            {activeFormTab === 'general' && <button type="button" className="admin-grammar-btn admin-grammar-btn--primary" onClick={() => setActiveFormTab('script')}>Tiếp tục (Kịch bản)</button>}
            {activeFormTab === 'script' && <button type="button" className="admin-grammar-btn admin-grammar-btn--primary" onClick={() => setActiveFormTab('questions')}>Tiếp tục (Câu hỏi)</button>}
            {activeFormTab === 'questions' && <button type="submit" className="admin-grammar-btn admin-grammar-btn--primary">{initialData ? 'Lưu cập nhật' : 'Tạo mới bài nghe'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
