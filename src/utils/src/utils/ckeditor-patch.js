// Monkey patch para resolver problemas de SVG no CKEditor
(function patchCKEditor() {
    try {
      // Intercepta a criação de elementos SVG
      const originalCreateElementNS = document.createElementNS;
      document.createElementNS = function(namespaceURI, qualifiedName) {
        const element = originalCreateElementNS.call(document, namespaceURI, qualifiedName);
        
        // Se for um elemento SVG, adicione um viewBox padrão
        if (namespaceURI === 'http://www.w3.org/2000/svg' && qualifiedName === 'svg') {
          element.setAttribute('viewBox', '0 0 20 20');
        }
        
        return element;
      };
  
      // Patch para o método _updateXMLContent que causa o erro
      const patchIcons = function() {
        if (window.CKEditorIcons) return; // Já foi aplicado
        
        // Lista de ícones de fallback para usar quando os SVGs originais falham
        window.CKEditorIcons = {
          'default': '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="none"/></svg>',
          'link': '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11.077 15l.991-1.416a.75.75 0 1 1 1.229.86l-1.148 1.64a.748.748 0 0 1-.217.206 5.251 5.251 0 0 1-8.503-5.955.741.741 0 0 1 .12-.274l1.147-1.639a.75.75 0 1 1 1.228.86L4.933 10.7l.006.003a3.75 3.75 0 0 0 6.132 4.294l.006.004zm5.494-5.335a.748.748 0 0 1-.12.274l-1.147 1.639a.75.75 0 1 1-1.228-.86l.86-1.23a3.75 3.75 0 0 0-6.144-4.301l-.86 1.229a.75.75 0 0 1-1.229-.86l1.148-1.64a.748.748 0 0 1 .217-.206 5.251 5.251 0 0 1 8.503 5.955zm-4.563-2.532a.75.75 0 0 1 .184 1.045l-3.155 4.505a.75.75 0 1 1-1.229-.86l3.155-4.506a.75.75 0 0 1 1.045-.184z"/></svg>',
          'image': '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6.91 10.54c.26-.23.64-.21.88.03l3.36 3.14 2.23-2.06a.64.64 0 0 1 .87 0l2.52 2.97V4.5H3.2v10.12l3.71-4.08zm10.27-7.51c.6 0 1.09.47 1.09 1.05v11.84c0 .59-.49 1.06-1.09 1.06H2.79c-.6 0-1.09-.47-1.09-1.06V4.08c0-.58.49-1.05 1.1-1.05h14.38zm-5.22 5.56a1.96 1.96 0 0 1 1.3.46l.3.26.26-.25a1.55 1.55 0 0 1 2.2.04l.66.8V7.5l-.95-.6c-.1-.07-.15-.17-.15-.3 0-.08.07-.17.15-.2l.95-.63V5.5a.63.63 0 0 0-.64-.63H4.81c-.35 0-.64.3-.64.63v.8l.95.63a.29.29 0 0 1 0 .5l-.95.6v2.01l3.54-3.93c.54-.58 1.44-.63 2.25-.2z"/></svg>'
        };
        
        // Patch original _updateXMLContent
        const originalXMLContentUpdate = window.ckeditor_updateXMLContent = window.ckeditor_updateXMLContent || function(){};
        window._updateXMLContent = function(svg, content) {
          try {
            // Se o SVG for nulo, retorna um SVG de fallback
            if (!svg) {
              const tempDiv = document.createElement('div');
              const iconName = (content || '').includes('link') ? 'link' : 
                             (content || '').includes('image') ? 'image' : 'default';
              tempDiv.innerHTML = window.CKEditorIcons[iconName];
              return tempDiv.firstChild;
            }
            
            // Caso contrário, usa a implementação original
            return originalXMLContentUpdate.apply(this, arguments);
          } catch (e) {
            console.warn('Erro ao atualizar conteúdo SVG', e);
            // Retorna um SVG vazio em caso de erro
            const emptySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            emptySvg.setAttribute('viewBox', '0 0 20 20');
            return emptySvg;
          }
        };
      };
      
      // Aplicamos o patch quando a página carregar
      if (document.readyState === 'complete') {
        patchIcons();
      } else {
        window.addEventListener('load', patchIcons);
      }
    } catch (e) {
      console.warn('Não foi possível aplicar patch para o CKEditor:', e);
    }
  })();