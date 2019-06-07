module.exports = {
  apex: (fileName: string, userName: string, currentTime: string) => `/**
 * @File Name          : ${fileName}
 * @Description        : 
 * @Author             : ${userName}
 * @Group              : 
 * @Last Modified By   : ${userName}
 * @Last Modified On   : ${currentTime}
 * @Modification Log   : 
 *==============================================================================
 * Ver         Date                     Author      		      Modification
 *==============================================================================
 * 1.0    ${currentTime}   ${userName}     Initial Version
**/
`,
  visualforce: (
    fileName: string,
    userName: string,
    currentTime: string
  ) => `<!--
  @Page Name          : ${fileName}
  @Description        : 
  @Author             : ${userName}
  @Group              : 
  @Last Modified By   : ${userName}
  @Last Modified On   : ${currentTime}
  @Modification Log   : 
  ==============================================================================
  Ver         Date                     Author      		      Modification
  ==============================================================================
  1.0    ${currentTime}   ${userName}     Initial Version
-->
`,
  html: (fileName: string, userName: string, currentTime: string) => `<!--
  @Component Name     : ${fileName}
  @Description        : 
  @Author             : ${userName}
  @Group              : 
  @Last Modified By   : ${userName}
  @Last Modified On   : ${currentTime}
  @Modification Log   : 
  ==============================================================================
  Ver         Date                     Author      		      Modification
  ==============================================================================
  1.0    ${currentTime}   ${userName}     Initial Version
-->
`,
  xml: (fileName: string, userName: string, currentTime: string) => `<!--
  @Component Name     : ${fileName}
  @Description        : 
  @Author             : ${userName}
  @Group              : 
  @Last Modified By   : ${userName}
  @Last Modified On   : ${currentTime}
  @Modification Log   : 
  ==============================================================================
  Ver         Date                     Author      		      Modification
  ==============================================================================
  1.0    ${currentTime}   ${userName}     Initial Version
-->
`,
  javascript: (fileName: string, userName: string, currentTime: string) => `/**
 * @File Name          : ${fileName}
 * @Description        : 
 * @Author             : ${userName}
 * @Group              : 
 * @Last Modified By   : ${userName}
 * @Last Modified On   : ${currentTime}
 * @Modification Log   : 
 *==============================================================================
 * Ver         Date                     Author      		      Modification
 *==============================================================================
 * 1.0    ${currentTime}   ${userName}     Initial Version
**/
`
};
