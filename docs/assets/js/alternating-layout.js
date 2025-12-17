/**
 * Alternating Image Layout Script
 * Automatically arranges images and their following text in an alternating left/right layout
 * for a better visual experience similar to www.maslowcnc.com/user-guide
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlternatingLayout);
  } else {
    initAlternatingLayout();
  }

  function initAlternatingLayout() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // Get all direct children of main content
    const children = Array.from(mainContent.children);
    let imageCounter = 0;
    let elementsToGroup = [];

    children.forEach((element, index) => {
      // Check if element is an image or contains an image
      const hasImage = element.tagName === 'IMG' ||
                      (element.tagName === 'P' && element.querySelector('img'));

      // If we hit a heading, process any pending section first
      if (element.tagName === 'H2' || element.tagName === 'H3') {
        if (elementsToGroup.length > 0) {
          createImageSection(elementsToGroup, imageCounter, mainContent);
          imageCounter++;
          elementsToGroup = [];
        }
        return;
      }

      // If we find an image, start collecting elements
      if (hasImage) {
        // Process any previous section first
        if (elementsToGroup.length > 0) {
          createImageSection(elementsToGroup, imageCounter, mainContent);
          imageCounter++;
          elementsToGroup = [];
        }

        // Start new section with this image
        elementsToGroup.push(element);

        // Look ahead to collect following text paragraphs and lists
        let nextIndex = index + 1;
        while (nextIndex < children.length) {
          const nextElement = children[nextIndex];

          // Stop if we hit another image or heading
          if (nextElement.tagName === 'H2' || nextElement.tagName === 'H3') {
            break;
          }

          const nextHasImage = nextElement.tagName === 'IMG' ||
                              (nextElement.tagName === 'P' && nextElement.querySelector('img'));
          if (nextHasImage) {
            break;
          }

          // Collect text content (paragraphs, lists, blockquotes)
          if (nextElement.tagName === 'P' ||
              nextElement.tagName === 'UL' ||
              nextElement.tagName === 'OL' ||
              nextElement.tagName === 'BLOCKQUOTE') {
            elementsToGroup.push(nextElement);
            nextIndex++;
          } else {
            break;
          }
        }

        // Create the section
        createImageSection(elementsToGroup, imageCounter, mainContent);
        imageCounter++;
        elementsToGroup = [];
      }
    });
  }

  function createImageSection(elements, counter, container) {
    if (elements.length === 0) return;

    // Create wrapper section
    const section = document.createElement('div');
    section.className = 'image-section';

    // Alternate between left and right
    if (counter % 2 === 0) {
      section.classList.add('image-left');
    } else {
      section.classList.add('image-right');
    }

    // Find the first element (which contains or is the image)
    let firstElement = elements[0];
    let imgElement;

    if (firstElement.tagName === 'P' && firstElement.querySelector('img')) {
      // Extract the image from the paragraph
      imgElement = firstElement.querySelector('img');
    } else if (firstElement.tagName === 'IMG') {
      imgElement = firstElement;
    }

    if (!imgElement) return;

    // Clone the image
    const imgClone = imgElement.cloneNode(true);
    section.appendChild(imgClone);

    // Create text content container
    const textContainer = document.createElement('div');
    textContainer.className = 'text-content';

    // If first element is a paragraph with an image, extract any text content
    if (firstElement.tagName === 'P' && firstElement.querySelector('img')) {
      // Clone the paragraph without the image
      const textOnlyPara = firstElement.cloneNode(true);
      const imgInPara = textOnlyPara.querySelector('img');
      if (imgInPara) {
        imgInPara.remove();
      }
      // Only add the paragraph if it has text content
      if (textOnlyPara.textContent.trim()) {
        textContainer.appendChild(textOnlyPara);
      }
    }

    // Add remaining elements
    for (let i = 1; i < elements.length; i++) {
      const clone = elements[i].cloneNode(true);
      textContainer.appendChild(clone);
    }

    // Only add text container if it has content
    if (textContainer.children.length > 0 || textContainer.textContent.trim()) {
      section.appendChild(textContainer);
    }

    // Insert the section before the first original element
    container.insertBefore(section, elements[0]);

    // Remove the original elements
    elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }
})();
