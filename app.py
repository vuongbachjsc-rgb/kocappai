import os
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

APP_VERSION = "v1.2"

@app.route('/')
def index():
    return render_template('index.html', version=APP_VERSION)

@app.route('/generate', methods=['POST'])
def generate():
    try:
        face_img = request.files.get('faceImage')
        prod_img = request.files.get('productImage')
        batch_count = int(request.form.get('batch_count', 5))
        
        if not face_img or not prod_img:
            return jsonify({'success': False, 'error': 'Thiếu file hình ảnh đầu vào!'})
        
        face_filename = secure_filename(face_img.filename)
        prod_filename = secure_filename(prod_img.filename)
        
        face_path = os.path.join(app.config['UPLOAD_FOLDER'], face_filename)
        prod_path = os.path.join(app.config['UPLOAD_FOLDER'], prod_filename)
        
        face_img.save(face_path)
        prod_img.save(prod_path)
        
        # Trả về đường dẫn ảnh thực tế người dùng vừa tải lên để làm preview KOC thời trang
        face_url = url_for('static', filename=f'uploads/{face_filename}')
        prod_url = url_for('static', filename=f'uploads/{prod_filename}')
        
        generated_results = []
        for i in range(min(batch_count, 10)):
            generated_results.append({
                'id': i + 1,
                'face': face_url,
                'product': prod_url
            })
            
        return jsonify({
            'success': True,
            'version': APP_VERSION,
            'count': batch_count,
            'videos': generated_results
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
